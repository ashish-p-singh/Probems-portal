import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transitionProblemStatus } from '@/lib/workflow'
import { createNotification, notifyRole } from '@/lib/notifications'

// GET all projects (university sees all active, faculty sees assigned)
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const where: any = {}
  if (session.user.role === 'FACULTY') {
    where.facultyAssignment = { facultyId: session.user.id }
  } else if (session.user.role === 'UNIVERSITY') {
    where.OR = [
      { universityId: session.user.id },
      { status: { in: ['ACCEPTED', 'TEAM_FORMATION', 'IN_PROGRESS', 'SOLUTION_SUBMITTED', 'GOVERNMENT_APPROVED', 'INDUSTRY_COLLABORATION', 'IMPLEMENTATION', 'COMPLETED'] } },
    ]
  }

  const projects = await prisma.universityProject.findMany({
    where,
    include: {
      problem: { select: { title: true, referenceId: true, status: true, location: true, category: true } },
      university: { select: { name: true } },
      team: { select: { name: true, _count: { select: { members: true } } } },
      facultyAssignment: { include: { faculty: { select: { name: true } } } },
      milestones: { select: { completedAt: true } },
      solution: { select: { id: true, proposedSolution: true, technicalApproach: true, estimatedCost: true, expectedImpact: true, status: true } },
      collaborations: { include: { industryPartner: { select: { name: true } }, funding: true } },
      _count: { select: { tasks: true, milestones: true, documents: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(projects)
}

// POST create or accept project (university accepts problem)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !['UNIVERSITY', 'FACULTY', 'ADMIN'].includes(session.user.role)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { problemId, action, rejectionReason, title, description } = body

    if (!problemId) {
      return Response.json({ error: 'Problem ID is required' }, { status: 400 })
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { citizen: true },
    })
    if (!problem) return Response.json({ error: 'Problem not found' }, { status: 404 })

    if (action === 'REJECT') {
      await transitionProblemStatus(problemId, 'REJECTED_BY_UNIVERSITY', session.user.id, 'Problem Rejected by University', rejectionReason)
      await createNotification({
        userId: problem.citizenId,
        title: `Problem ${problem.referenceId} — University Decision`,
        message: `The university was unable to accept your problem at this time.`,
        type: 'ALERT',
        problemId,
      })
      return Response.json({ success: true })
    }

    // ACCEPT: Check if a UniversityProject record already exists (e.g. staged as challenge brief during gov verification)
    const existingProject = await prisma.universityProject.findUnique({
      where: { problemId },
    })

    let project
    if (existingProject) {
      project = await prisma.universityProject.update({
        where: { problemId },
        data: {
          universityId: session.user.id,
          title: title || existingProject.title || `Project: ${problem.title}`,
          description: description || existingProject.description,
          status: 'ACCEPTED',
        },
      })
    } else {
      project = await prisma.universityProject.create({
        data: {
          problemId,
          universityId: session.user.id,
          title: title || `Project: ${problem.title}`,
          description,
          status: 'ACCEPTED',
        },
      })
    }

    await transitionProblemStatus(
      problemId,
      'ACCEPTED',
      session.user.id,
      'Problem Accepted by University',
      'University has accepted this problem and initialized a research project.'
    )

    await prisma.auditLog.create({
      data: {
        problemId,
        projectId: project.id,
        userId: session.user.id,
        action: 'University Project Accepted',
        remarks: `Project "${project.title}" accepted by university.`,
      },
    })

    await createNotification({
      userId: problem.citizenId,
      title: `Problem ${problem.referenceId} — Accepted by University`,
      message: `Your problem has been accepted by the university. A multidisciplinary research team will be formed.`,
      type: 'INFO',
      problemId,
    })

    return Response.json(project, { status: 201 })
  } catch (error: any) {
    console.error('Error in /api/projects POST:', error)
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
