import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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
      { error: 'Forbidden: Your institutional account is pending Admin approval before taking official verification actions.' },
      { status: 403 }
    )
  }

  const body = await req.json()
  const {
    action,
    remarks,
    municipalityInput,
    siteVisited,
    evidenceReviewed,
    populationValidated,
    localBodyConsulted,
    concurrenceOfficial,
    concurrenceDesignation,
    concurrenceNotes,
    recommendedDept,
    priorityScore,
    slaDays,
  } = body

  const { id } = await ctx.params

  const problem = await prisma.problem.findUnique({
    where: { id },
    include: { citizen: true },
  })
  if (!problem) return Response.json({ error: 'Not found' }, { status: 404 })

  let verificationStatus = 'PENDING'
  let newProblemStatus = problem.status as string
  let auditAction = ''

  if (action === 'START_VERIFICATION') {
    newProblemStatus = 'UNDER_VERIFICATION'
    verificationStatus = 'PENDING'
    auditAction = 'Verification Initiated'
  } else if (action === 'REQUEST_INFO') {
    newProblemStatus = 'ADDITIONAL_INFO_REQUIRED'
    verificationStatus = 'ADDITIONAL_INFO_REQUIRED'
    auditAction = 'Additional Information Requested'
  } else if (action === 'VERIFY') {
    newProblemStatus = 'VERIFIED'
    verificationStatus = 'VERIFIED'
    auditAction = 'Problem Officially Verified'
  } else if (action === 'REJECT') {
    newProblemStatus = 'REJECTED_BY_GOVT'
    verificationStatus = 'REJECTED'
    auditAction = 'Problem Rejected by Government Authority'
  } else if (action === 'FORWARD_TO_UNIVERSITY') {
    newProblemStatus = 'UNDER_UNIVERSITY_REVIEW'
    verificationStatus = 'VERIFIED'
    auditAction = 'Challenge Brief Published to Universities'
  } else {
    return Response.json({ error: 'Invalid action' }, { status: 400 })
  }

  const slaDueDate = slaDays ? new Date(Date.now() + parseInt(slaDays) * 24 * 60 * 60 * 1000) : undefined

  // Upsert verification record
  const verification = await prisma.problemVerification.upsert({
    where: { problemId: id },
    update: {
      status: verificationStatus,
      govOfficerId: session.user.id,
      remarks,
      municipalityInput,
      siteVisited: !!siteVisited,
      evidenceReviewed: !!evidenceReviewed,
      populationValidated: !!populationValidated,
      localBodyConsulted: !!localBodyConsulted,
      concurrenceOfficial: concurrenceOfficial || undefined,
      concurrenceDesignation: concurrenceDesignation || undefined,
      concurrenceDate: concurrenceOfficial ? new Date() : undefined,
      concurrenceNotes: concurrenceNotes || undefined,
      recommendedDept: recommendedDept || undefined,
      priorityScore: priorityScore ? parseFloat(priorityScore) : undefined,
      slaDueDate: slaDueDate || undefined,
      verifiedAt: action === 'VERIFY' || action === 'FORWARD_TO_UNIVERSITY' ? new Date() : undefined,
    },
    create: {
      problemId: id,
      govOfficerId: session.user.id,
      status: verificationStatus,
      remarks,
      municipalityInput,
      siteVisited: !!siteVisited,
      evidenceReviewed: !!evidenceReviewed,
      populationValidated: !!populationValidated,
      localBodyConsulted: !!localBodyConsulted,
      concurrenceOfficial: concurrenceOfficial || undefined,
      concurrenceDesignation: concurrenceDesignation || undefined,
      concurrenceDate: concurrenceOfficial ? new Date() : undefined,
      concurrenceNotes: concurrenceNotes || undefined,
      recommendedDept: recommendedDept || undefined,
      priorityScore: priorityScore ? parseFloat(priorityScore) : undefined,
      slaDueDate: slaDueDate || undefined,
      verifiedAt: action === 'VERIFY' || action === 'FORWARD_TO_UNIVERSITY' ? new Date() : undefined,
    },
  })

  // Update Problem status
  await prisma.problem.update({
    where: { id },
    data: { status: newProblemStatus },
  })

  // If forwarded to universities, ensure UniversityProject challenge brief exists
  if (action === 'FORWARD_TO_UNIVERSITY' || action === 'VERIFY') {
    const existingProject = await prisma.universityProject.findUnique({ where: { problemId: id } })
    if (!existingProject) {
      await prisma.universityProject.create({
        data: {
          problemId: id,
          universityId: session.user.id, // initially staged by government
          title: `Challenge: ${problem.title}`,
          description: problem.description,
          challengeBrief: JSON.stringify({
            context: problem.description,
            location: problem.location,
            recommendedDept: recommendedDept || 'Engineering & Urban Infrastructure',
            affectedPopulation: problem.affectedPopulation,
            priorityScore: priorityScore || 80,
            slaDueDate: slaDueDate?.toISOString(),
          }),
          status: 'PENDING_REVIEW',
        },
      })
    }
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      problemId: id,
      userId: session.user.id,
      action: auditAction,
      previousStatus: problem.status,
      newStatus: newProblemStatus,
      remarks: remarks || `Status updated to ${newProblemStatus}`,
    },
  })

  // Citizen notification
  await createNotification({
    userId: problem.citizenId,
    problemId: id,
    title: `Problem Status: ${auditAction}`,
    message: remarks
      ? `Update from verification authority: "${remarks}"`
      : `Your reported problem is now ${newProblemStatus.replace(/_/g, ' ').toLowerCase()}.`,
    type: action === 'REJECT' ? 'ALERT' : 'INFO',
    link: `/problems/${id}`,
  })

  return Response.json({ success: true, status: newProblemStatus, verification })
}
