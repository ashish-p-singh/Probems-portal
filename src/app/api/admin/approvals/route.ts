import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'PENDING'

  const users = await prisma.user.findMany({
    where: status === 'ALL' ? {} : { accountStatus: status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      accountStatus: true,
      createdAt: true,
      government: true,
      university: true,
      faculty: true,
      industry: true,
      memberships: {
        include: { organization: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(users)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
  }

  const { userId, action, remarks } = await req.json()

  if (!userId || !action) {
    return Response.json({ error: 'userId and action are required' }, { status: 400 })
  }

  const newStatus = action === 'APPROVE' ? 'APPROVED' : action === 'SUSPEND' ? 'SUSPENDED' : 'REJECTED'

  const user = await prisma.user.update({
    where: { id: userId },
    data: { accountStatus: newStatus },
  })

  // Also update any organization memberships
  await prisma.organizationMembership.updateMany({
    where: { userId },
    data: { status: newStatus },
  })

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: `Account ${newStatus}`,
      remarks: remarks || `Admin ${session.user.name} set account status to ${newStatus}`,
    },
  })

  // Notify the user
  await prisma.notification.create({
    data: {
      userId,
      title: `Account ${newStatus}`,
      message:
        newStatus === 'APPROVED'
          ? 'Your institutional account has been approved by the platform administrator. You now have full operational privileges.'
          : `Your account status has been updated to: ${newStatus}. Reason: ${remarks || 'Administrative review'}`,
      type: newStatus === 'APPROVED' ? 'INFO' : 'ALERT',
    },
  })

  return Response.json({ success: true, user })
}
