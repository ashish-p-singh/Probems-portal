import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const session = await auth()
  const { id: problemId } = await ctx.params

  const count = await prisma.communityConfirmation.count({
    where: { problemId },
  })

  const hasConfirmed = session?.user?.id
    ? !!(await prisma.communityConfirmation.findUnique({
        where: {
          problemId_citizenId: {
            problemId,
            citizenId: session.user.id,
          },
        },
      }))
    : false

  return Response.json({ count, hasConfirmed })
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Please sign in to confirm this community issue' }, { status: 401 })
  }

  const { id: problemId } = await ctx.params

  const existing = await prisma.communityConfirmation.findUnique({
    where: {
      problemId_citizenId: {
        problemId,
        citizenId: session.user.id,
      },
    },
  })

  let hasConfirmed = false

  if (existing) {
    // Un-confirm
    await prisma.communityConfirmation.delete({
      where: { id: existing.id },
    })
    hasConfirmed = false
  } else {
    // Confirm
    await prisma.communityConfirmation.create({
      data: {
        problemId,
        citizenId: session.user.id,
      },
    })
    hasConfirmed = true
  }

  const count = await prisma.communityConfirmation.count({
    where: { problemId },
  })

  return Response.json({ count, hasConfirmed })
}
