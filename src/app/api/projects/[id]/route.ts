import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transitionProblemStatus } from '@/lib/workflow'
import { createNotification, notifyRole } from '@/lib/notifications'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET project detail
export async function GET(req: NextRequest, ctx: RouteContext) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  const project = await prisma.universityProject.findUnique({
    where: { id },
    include: {
      problem: {
        include: {
          citizen: { select: { id: true, name: true, email: true } },
          evidence: true,
          verification: { include: { govOfficer: { select: { name: true, government: true } } } },
        },
      },
      university: { select: { id: true, name: true, university: true } },
      team: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true, role: true, faculty: true } } },
          },
        },
      },
      facultyAssignment: {
        include: { faculty: { select: { id: true, name: true, email: true, faculty: true } } },
      },
      tasks: {
        include: { assignee: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      milestones: { orderBy: { order: 'asc' } },
      documents: {
        include: { uploadedBy: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      solution: {
        include: {
          rubricEvaluations: {
            include: { evaluator: { select: { name: true, role: true } } },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      validation: { include: { govOfficer: { select: { name: true, government: true } } } },
      collaborations: {
        include: {
          industryPartner: { select: { id: true, name: true, industry: true } },
          funding: true,
          resources: true,
        },
      },
      implementation: true,
      impactMetrics: true,
      checkpoints: {
        include: { citizen: { select: { name: true } } },
        orderBy: { checkpointDay: 'asc' },
      },
    },
  })

  if (!project) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(project)
}

// PATCH update project (acceptance, team, proposal, board CRUD, pilot, checkpoints)
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  const body = await req.json()
  const { action, ...data } = body

  const project = await prisma.universityProject.findUnique({
    where: { id },
    include: { problem: true, solution: true },
  })
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 })

  // 1. Accept Challenge (University)
  if (action === 'ACCEPT_CHALLENGE') {
    if (!['UNIVERSITY', 'FACULTY', 'ADMIN'].includes(session.user.role)) {
      return Response.json({ error: 'Only University/Faculty can accept challenges' }, { status: 403 })
    }
    if (session.user.accountStatus !== 'APPROVED') {
      return Response.json({ error: 'Account pending admin approval' }, { status: 403 })
    }

    await prisma.universityProject.update({
      where: { id },
      data: {
        universityId: session.user.id,
        status: 'ACCEPTED',
      },
    })

    await transitionProblemStatus(
      project.problemId,
      'ACCEPTED',
      session.user.id,
      'Challenge Accepted by University',
      `${session.user.name} accepted the research and engineering challenge.`
    )

    return Response.json({ success: true, status: 'ACCEPTED' })
  }

  // 2. Create / Update Team
  if (action === 'CREATE_TEAM') {
    const { teamName, teamDescription, members, facultyId } = data

    const existingTeam = await prisma.universityTeam.findUnique({ where: { projectId: id } })
    let team
    if (existingTeam) {
      team = await prisma.universityTeam.update({
        where: { projectId: id },
        data: { name: teamName || 'Multidisciplinary Impact Team', description: teamDescription },
      })
    } else {
      team = await prisma.universityTeam.create({
        data: { projectId: id, name: teamName || 'Multidisciplinary Impact Team', description: teamDescription },
      })
    }

    if (members && Array.isArray(members)) {
      for (const m of members) {
        if (m.userId) {
          await prisma.teamMember.upsert({
            where: { id: m.id || 'new-member' },
            update: { role: m.role, discipline: m.discipline, responsibilities: m.responsibilities },
            create: { teamId: team.id, userId: m.userId, role: m.role, discipline: m.discipline, responsibilities: m.responsibilities },
          }).catch(() => {})
        }
      }
    }

    if (facultyId) {
      await prisma.facultyLeaderAssignment.upsert({
        where: { projectId: id },
        update: { facultyId },
        create: { projectId: id, facultyId },
      })
    }

    await prisma.universityProject.update({ where: { id }, data: { status: 'TEAM_FORMATION' } })
    await transitionProblemStatus(project.problemId, 'TEAM_FORMATION', session.user.id, 'Team Formation Initialized', 'Multidisciplinary team assembled.')

    return Response.json({ success: true })
  }

  // 3. Start Development
  if (action === 'START_DEVELOPMENT') {
    await prisma.universityProject.update({ where: { id }, data: { status: 'IN_PROGRESS' } })
    await transitionProblemStatus(project.problemId, 'SOLUTION_DEVELOPMENT', session.user.id, 'Solution Research & Development Started')
    return Response.json({ success: true })
  }

  // 4. Save Editable Solution Proposal (Draft / Versioning)
  if (action === 'SAVE_SOLUTION_PROPOSAL') {
    const {
      problemStatement,
      rootCause,
      alternativesConsidered,
      proposedSolution,
      technicalApproach,
      expectedImpact,
      estimatedCost,
      requiredResources,
      timeline,
      risksAndMitigations,
      environmentalSocial,
      implementationPlan,
      sustainabilityPlan,
      prototypeUrl,
    } = data

    const existingSolution = await prisma.solution.findUnique({ where: { projectId: id } })
    let sol
    if (existingSolution) {
      sol = await prisma.solution.update({
        where: { projectId: id },
        data: {
          problemStatement: problemStatement || existingSolution.problemStatement,
          rootCause: rootCause || existingSolution.rootCause,
          alternativesConsidered: alternativesConsidered !== undefined ? alternativesConsidered : existingSolution.alternativesConsidered,
          proposedSolution: proposedSolution || existingSolution.proposedSolution,
          technicalApproach: technicalApproach || existingSolution.technicalApproach,
          expectedImpact: expectedImpact || existingImpactFallback(existingSolution.expectedImpact),
          estimatedCost: estimatedCost ? parseFloat(String(estimatedCost)) : existingSolution.estimatedCost,
          requiredResources: requiredResources !== undefined ? requiredResources : existingSolution.requiredResources,
          timeline: timeline !== undefined ? timeline : existingSolution.timeline,
          risksAndMitigations: risksAndMitigations !== undefined ? risksAndMitigations : existingSolution.risksAndMitigations,
          environmentalSocial: environmentalSocial !== undefined ? environmentalSocial : existingSolution.environmentalSocial,
          implementationPlan: implementationPlan || existingSolution.implementationPlan,
          sustainabilityPlan: sustainabilityPlan || existingSolution.sustainabilityPlan,
          prototypeUrl: prototypeUrl !== undefined ? prototypeUrl : existingSolution.prototypeUrl,
          version: existingSolution.version + 1,
        },
      })
    } else {
      sol = await prisma.solution.create({
        data: {
          projectId: id,
          problemStatement: problemStatement || project.problem.title,
          rootCause: rootCause || 'Identified via field analysis',
          alternativesConsidered,
          proposedSolution: proposedSolution || 'Engineered civic intervention',
          technicalApproach: technicalApproach || 'Multidisciplinary methodology',
          expectedImpact: expectedImpact || 'High community benefit',
          estimatedCost: estimatedCost ? parseFloat(String(estimatedCost)) : 50000,
          requiredResources,
          timeline: timeline || '6 weeks',
          risksAndMitigations,
          environmentalSocial,
          implementationPlan: implementationPlan || 'Phased pilot deployment',
          sustainabilityPlan: sustainabilityPlan || 'Long-term maintenance partnership',
          prototypeUrl,
          version: 1,
        },
      })
    }

    return Response.json({ success: true, solution: sol })
  }

  // 5. Faculty Sign-off on Proposal
  if (action === 'FACULTY_SIGN_OFF') {
    if (!['FACULTY', 'UNIVERSITY', 'ADMIN'].includes(session.user.role)) {
      return Response.json({ error: 'Only Faculty Mentor can sign off on solution proposals' }, { status: 403 })
    }

    await prisma.solution.update({
      where: { projectId: id },
      data: {
        facultyApproved: true,
        facultyApprovedAt: new Date(),
        facultyRemarks: data.facultyRemarks || 'Approved by Faculty Mentor for Government Validation',
        status: 'FACULTY_REVIEW',
      },
    })

    return Response.json({ success: true, message: 'Proposal certified by Faculty Leader.' })
  }

  // 6. Submit Proposal to Government for Rubric Evaluation
  if (action === 'SUBMIT_SOLUTION') {
    await prisma.universityProject.update({ where: { id }, data: { status: 'SOLUTION_SUBMITTED' } })
    await prisma.solution.update({
      where: { projectId: id },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    })
    await transitionProblemStatus(project.problemId, 'SOLUTION_SUBMITTED', session.user.id, 'Solution Proposal Submitted for Government Validation')
    await notifyRole('GOVERNMENT', 'Solution Ready for Validation', `Solution proposal for "${project.problem.title}" is ready for rubric evaluation.`, 'ACTION', `/problems/${project.problemId}`)

    return Response.json({ success: true })
  }

  // 7. Project Board CRUD: Tasks
  if (action === 'ADD_TASK') {
    const task = await prisma.task.create({
      data: {
        projectId: id,
        title: data.title,
        description: data.description || null,
        priority: data.priority || 'MEDIUM',
        status: 'TODO',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assigneeId: data.assigneeId || null,
      },
    })
    return Response.json({ success: true, task })
  }

  if (action === 'UPDATE_TASK') {
    const task = await prisma.task.update({
      where: { id: data.taskId },
      data: {
        status: data.status,
        completedAt: data.status === 'COMPLETED' ? new Date() : null,
      },
    })
    return Response.json({ success: true, task })
  }

  if (action === 'DELETE_TASK') {
    await prisma.task.delete({ where: { id: data.taskId } })
    return Response.json({ success: true })
  }

  // 8. Project Board: Milestones
  if (action === 'ADD_MILESTONE') {
    const count = await prisma.milestone.count({ where: { projectId: id } })
    const milestone = await prisma.milestone.create({
      data: {
        projectId: id,
        title: data.title,
        description: data.description || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        order: count + 1,
      },
    })
    return Response.json({ success: true, milestone })
  }

  if (action === 'TOGGLE_MILESTONE') {
    const m = await prisma.milestone.findUnique({ where: { id: data.milestoneId } })
    if (m) {
      await prisma.milestone.update({
        where: { id: m.id },
        data: { completedAt: m.completedAt ? null : new Date() },
      })
    }
    return Response.json({ success: true })
  }

  // 9. Start Pilot / Implementation
  if (action === 'START_PILOT') {
    await prisma.universityProject.update({ where: { id }, data: { status: 'IMPLEMENTATION' } })
    await prisma.implementation.upsert({
      where: { projectId: id },
      update: {
        status: 'PILOT',
        startDate: new Date(),
        deploymentLocation: data.deploymentLocation || project.problem.location,
        implementationPartner: data.implementationPartner || 'Municipal Corporation & University Team',
      },
      create: {
        projectId: id,
        status: 'PILOT',
        startDate: new Date(),
        deploymentLocation: data.deploymentLocation || project.problem.location,
        implementationPartner: data.implementationPartner || 'Municipal Corporation & University Team',
      },
    })
    await transitionProblemStatus(project.problemId, 'IMPLEMENTATION', session.user.id, 'Pilot Implementation Initiated', 'On-ground field deployment started.')
    return Response.json({ success: true })
  }

  // 10. Citizen Resolution Confirmation (30, 90, 180 Days)
  if (action === 'RECORD_CHECKPOINT') {
    const checkpoint = await prisma.pilotCheckpoint.create({
      data: {
        projectId: id,
        checkpointDay: data.checkpointDay || 30,
        citizenId: session.user.id,
        status: data.status || 'CONFIRMED_IMPROVED', // CONFIRMED_IMPROVED | NOT_IMPROVED | NEEDS_FOLLOW_UP
        feedback: data.feedback || '',
      },
    })

    if (data.status === 'CONFIRMED_IMPROVED') {
      await transitionProblemStatus(project.problemId, 'PROBLEM_SOLVED', session.user.id, 'Citizen Confirmed Resolution', 'Citizen verified on-ground problem resolution.')
    }

    return Response.json({ success: true, checkpoint })
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 })
}

function existingImpactFallback(impact?: string) {
  return impact || 'Quantifiable community relief and infrastructure stabilization.'
}
