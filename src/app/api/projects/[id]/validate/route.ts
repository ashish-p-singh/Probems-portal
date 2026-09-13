import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transitionProblemStatus } from '@/lib/workflow'
import { createNotification, notifyRole } from '@/lib/notifications'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const session = await auth()
  if (!session?.user || !['GOVERNMENT', 'ADMIN'].includes(session.user.role)) {
    return Response.json({ error: 'Unauthorized: Government officer or Admin required' }, { status: 401 })
  }

  if (session.user.accountStatus !== 'APPROVED') {
    return Response.json(
      { error: 'Forbidden: Your institutional account must be approved before validating solutions.' },
      { status: 403 }
    )
  }

  const { id } = await ctx.params
  const body = await req.json()
  const {
    action, // 'APPROVE' | 'APPROVE_WITH_CONDITIONS' | 'REQUEST_CHANGES' | 'REJECT'
    feedback,
    feasibilityScore = 3,
    safetyScore = 3,
    costReasonableScore = 3,
    publicBenefitScore = 3,
    scalabilityScore = 3,
    sustainabilityScore = 3,
  } = body

  const project = await prisma.universityProject.findUnique({
    where: { id },
    include: {
      problem: { include: { citizen: true } },
      solution: true,
      facultyAssignment: true,
    },
  })
  if (!project || !project.solution) return Response.json({ error: 'Project or solution proposal not found' }, { status: 404 })

  let solutionStatus = ''
  let projectStatus: any = ''
  let problemStatus = ''
  let auditAction = ''

  const totalScore =
    Number(feasibilityScore) +
    Number(safetyScore) +
    Number(costReasonableScore) +
    Number(publicBenefitScore) +
    Number(scalabilityScore) +
    Number(sustainabilityScore)

  if (action === 'APPROVE' || action === 'APPROVED_FOR_PILOT') {
    solutionStatus = 'GOVERNMENT_APPROVED'
    projectStatus = 'GOVERNMENT_APPROVED'
    problemStatus = 'APPROVED'
    auditAction = 'Solution Approved for Pilot Deployment'
  } else if (action === 'APPROVE_WITH_CONDITIONS') {
    solutionStatus = 'GOVERNMENT_APPROVED'
    projectStatus = 'GOVERNMENT_APPROVED'
    problemStatus = 'APPROVED'
    auditAction = 'Solution Approved with Implementation Conditions'
  } else if (action === 'REQUEST_CHANGES' || action === 'CHANGES_REQUESTED') {
    solutionStatus = 'CHANGES_REQUESTED'
    projectStatus = 'CHANGES_REQUESTED'
    problemStatus = 'GOVERNMENT_VALIDATION'
    auditAction = 'Changes Requested by Government on Solution Proposal'
  } else if (action === 'REJECT') {
    solutionStatus = 'GOVERNMENT_REJECTED'
    projectStatus = 'REJECTED'
    problemStatus = 'GOVERNMENT_VALIDATION'
    auditAction = 'Solution Proposal Rejected by Government'
  } else {
    return Response.json({ error: 'Invalid action' }, { status: 400 })
  }

  // Create Rubric Evaluation record
  await prisma.rubricEvaluation.create({
    data: {
      solutionId: project.solution.id,
      evaluatorId: session.user.id,
      feasibilityScore: Number(feasibilityScore),
      safetyScore: Number(safetyScore),
      costReasonableScore: Number(costReasonableScore),
      publicBenefitScore: Number(publicBenefitScore),
      scalabilityScore: Number(scalabilityScore),
      sustainabilityScore: Number(sustainabilityScore),
      totalScore,
      verdict: action,
      feedback: feedback || '',
    },
  })

  // Upsert legacy validation record
  await prisma.governmentValidation.upsert({
    where: { projectId: id },
    update: {
      status: action,
      feedback: `${feedback ? feedback + '\n' : ''}Rubric Score: ${totalScore}/30`,
      govOfficerId: session.user.id,
      decidedAt: new Date(),
    },
    create: {
      solutionId: project.solution.id,
      projectId: id,
      govOfficerId: session.user.id,
      status: action,
      feedback: `${feedback ? feedback + '\n' : ''}Rubric Score: ${totalScore}/30`,
      decidedAt: new Date(),
    },
  })

  await prisma.solution.update({
    where: { id: project.solution.id },
    data: { status: solutionStatus },
  })

  await prisma.universityProject.update({
    where: { id },
    data: { status: projectStatus },
  })

  await transitionProblemStatus(
    project.problemId,
    problemStatus,
    session.user.id,
    auditAction,
    feedback ? `Feedback: ${feedback} (Rubric Score: ${totalScore}/30)` : `Rubric Score: ${totalScore}/30`
  )

  // Notify faculty leader
  if (project.facultyAssignment?.facultyId) {
    await createNotification({
      userId: project.facultyAssignment.facultyId,
      problemId: project.problemId,
      title: `Government Solution Verdict: ${action.replace(/_/g, ' ')}`,
      message: `Score: ${totalScore}/30. ${feedback || 'Please view Case Room for details.'}`,
      type: action.includes('APPROVE') ? 'INFO' : 'ALERT',
      link: `/problems/${project.problemId}`,
    })
  }

  return Response.json({ success: true, totalScore, status: problemStatus })
}
