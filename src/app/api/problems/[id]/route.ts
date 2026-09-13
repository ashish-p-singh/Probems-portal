import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  const problem = await prisma.problem.findUnique({
    where: { id },
    include: {
      citizen: { select: { id: true, name: true, email: true, citizen: true } },
      organization: true,
      evidence: true,
      verification: {
        include: { govOfficer: { select: { id: true, name: true, government: true } } },
      },
      project: {
        include: {
          university: { select: { id: true, name: true, university: true } },
          team: {
            include: {
              members: {
                include: { user: { select: { id: true, name: true, email: true, faculty: true, university: true } } },
              },
            },
          },
          facultyAssignment: {
            include: { faculty: { select: { id: true, name: true, faculty: true } } },
          },
          solution: {
            include: {
              rubricEvaluations: {
                include: { evaluator: { select: { name: true, role: true } } },
                orderBy: { createdAt: 'desc' },
              },
            },
          },
          validation: {
            include: { govOfficer: { select: { name: true } } },
          },
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
          milestones: { orderBy: { order: 'asc' } },
          tasks: { include: { assignee: { select: { name: true } } } },
          documents: true,
        },
      },
      communityConfirmations: session.user?.id
        ? { where: { citizenId: session.user.id }, select: { id: true } }
        : false,
      _count: { select: { communityConfirmations: true, evidence: true } },
      auditLogs: {
        include: { user: { select: { name: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!problem) return Response.json({ error: 'Not found' }, { status: 404 })

  // Data Confidentiality Protection:
  // Mask citizen contact details from unrelated citizens/public
  const isOwner = session.user.id === problem.citizenId
  const isPrivileged = ['GOVERNMENT', 'UNIVERSITY', 'FACULTY', 'ADMIN'].includes(session.user.role)

  const sanitizedCitizen = (isOwner || isPrivileged)
    ? problem.citizen
    : {
        id: problem.citizen.id,
        name: problem.citizen.name,
        email: '••••••••@masked.civic',
        citizen: null,
      }

  return Response.json({
    ...problem,
    citizen: sanitizedCitizen,
    hasConfirmed: Array.isArray(problem.communityConfirmations) && problem.communityConfirmations.length > 0,
    confirmationCount: problem._count?.communityConfirmations || 0,
  })
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await ctx.params
    const problem = await prisma.problem.findUnique({
      where: { id },
      include: { project: true },
    })

    if (!problem) {
      return Response.json({ error: 'Problem not found' }, { status: 404 })
    }

    // Only the reporting citizen or an Admin can delete
    const isOwner = session.user.id === problem.citizenId
    const isAdmin = session.user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return Response.json({ error: 'Forbidden: You can only delete your own reported problems' }, { status: 403 })
    }

    // Cascade delete related records
    await prisma.$transaction(async (tx) => {
      // 1. Delete community confirmations
      await tx.communityConfirmation.deleteMany({ where: { problemId: id } })

      // 2. Delete evidence
      await tx.problemEvidence.deleteMany({ where: { problemId: id } })

      // 3. Delete verifications
      await tx.problemVerification.deleteMany({ where: { problemId: id } })

      // 4. Delete notifications
      await tx.notification.deleteMany({ where: { problemId: id } })

      // 5. Clean up project if any
      if (problem.project) {
        const projId = problem.project.id
        await tx.pilotCheckpoint.deleteMany({ where: { projectId: projId } })
        await tx.impactMetric.deleteMany({ where: { projectId: projId } })
        await tx.milestone.deleteMany({ where: { projectId: projId } })
        await tx.task.deleteMany({ where: { projectId: projId } })
        await tx.document.deleteMany({ where: { projectId: projId } })
        await tx.governmentValidation.deleteMany({ where: { projectId: projId } })
        await tx.industryCollaboration.deleteMany({ where: { projectId: projId } })
        await tx.facultyLeaderAssignment.deleteMany({ where: { projectId: projId } })

        const solution = await tx.solution.findUnique({ where: { projectId: projId } })
        if (solution) {
          await tx.rubricEvaluation.deleteMany({ where: { solutionId: solution.id } })
          await tx.solution.delete({ where: { id: solution.id } })
        }

        const team = await tx.universityTeam.findUnique({ where: { projectId: projId } })
        if (team) {
          await tx.teamMember.deleteMany({ where: { teamId: team.id } })
          await tx.universityTeam.delete({ where: { id: team.id } })
        }

        await tx.universityProject.delete({ where: { id: projId } })
      }

      // 6. Delete audit logs referencing this problem
      await tx.auditLog.deleteMany({ where: { problemId: id } })

      // 7. Delete the problem itself
      await tx.problem.delete({ where: { id } })

      // 8. Log deletion action
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'DELETE_PROBLEM',
          remarks: JSON.stringify({
            title: problem.title,
            deletedByRole: session.user.role,
            referenceId: problem.referenceId,
          }),
        },
      })
    })

    return Response.json({ success: true, message: 'Problem successfully deleted' })
  } catch (error) {
    console.error('Failed to delete problem:', error)
    return Response.json({ error: 'Failed to delete problem record' }, { status: 500 })
  }
}

