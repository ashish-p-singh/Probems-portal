import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transitionProblemStatus } from '@/lib/workflow'
import { createNotification } from '@/lib/notifications'

export async function GET(req: NextRequest, ctx: RouteContext<'/api/projects/[id]/collaborate'>) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  const collaborations = await prisma.industryCollaboration.findMany({
    where: { projectId: id },
    include: {
      industryPartner: { select: { name: true, industry: true } },
      funding: true,
      resources: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(collaborations)
}

export async function POST(req: NextRequest, ctx: RouteContext<'/api/projects/[id]/collaborate'>) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  const body = await req.json()
  const { action, collaborationType, description, amount, purpose, collaborationId } = body

  const project = await prisma.universityProject.findUnique({
    where: { id },
    include: { problem: true, facultyAssignment: true },
  })
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 })

  if (session.user.role === 'INDUSTRY' && session.user.accountStatus !== 'APPROVED') {
    return Response.json(
      { error: 'Forbidden: Your Industry account is pending Admin approval before committing partnerships or CSR resources.' },
      { status: 403 }
    )
  }

  if (action === 'EXPRESS_INTEREST' && session.user.role === 'INDUSTRY') {
    const collab = await prisma.industryCollaboration.create({
      data: {
        projectId: id,
        industryPartnerId: session.user.id,
        collaborationType: collaborationType || 'TECHNICAL_SUPPORT',
        description,
        status: 'INTERESTED',
      },
    })

    if (amount) {
      await prisma.fundingRecord.create({
        data: {
          collaborationId: collab.id,
          amountCommitted: parseFloat(amount),
          purpose,
        },
      })
    }

    if (project.facultyAssignment) {
      await createNotification({
        userId: project.facultyAssignment.facultyId,
        title: 'Industry Interest Received',
        message: `An industry partner has expressed interest in collaborating on your project.`,
        type: 'ACTION',
      })
    }

    return Response.json(collab, { status: 201 })
  }

  if (action === 'CONFIRM' && ['UNIVERSITY', 'FACULTY'].includes(session.user.role)) {
    const collab = await prisma.industryCollaboration.update({
      where: { id: collaborationId },
      data: { status: 'CONFIRMED', confirmedAt: new Date() },
    })

    await transitionProblemStatus(project.problemId, 'INDUSTRY_COLLABORATION', session.user.id, 'Industry Collaboration Confirmed')
    await prisma.universityProject.update({ where: { id }, data: { status: 'INDUSTRY_COLLABORATION' } })

    await createNotification({
      userId: collab.industryPartnerId,
      title: 'Collaboration Confirmed',
      message: `Your collaboration on project has been confirmed.`,
      type: 'INFO',
    })

    return Response.json(collab)
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 })
}
