import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(notifications)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id } = body

  if (id) {
    await prisma.notification.update({ where: { id, userId: session.user.id }, data: { read: true } })
  } else {
    await prisma.notification.updateMany({ where: { userId: session.user.id }, data: { read: true } })
  }

  return NextResponse.json({ success: true })
}
