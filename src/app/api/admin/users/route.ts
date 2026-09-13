import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const query = searchParams.get('q')

    const where: any = {}
    if (role && role !== 'ALL') where.role = role
    if (status && status !== 'ALL') where.accountStatus = status
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true,
        themePreference: true,
        createdAt: true,
        memberships: {
          include: {
            organization: {
              select: { name: true, type: true, department: true },
            },
          },
        },
        _count: {
          select: {
            problems: true,
            auditLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Failed to list admin users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { userId, role, accountStatus } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role ? { role } : {}),
        ...(accountStatus ? { accountStatus } : {}),
      },
      select: { id: true, name: true, email: true, role: true, accountStatus: true },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ADMIN_UPDATE_USER',
        newStatus: updated.accountStatus,
        remarks: JSON.stringify({ userId, previousRole: user.role, newRole: updated.role, newStatus: updated.accountStatus }),
      },
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own admin account' }, { status: 400 })
    }

    const target = await prisma.user.findUnique({ where: { id: userId } })
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Cascade delete user relations
    await prisma.$transaction(async (tx) => {
      await tx.organizationMembership.deleteMany({ where: { userId } })
      await tx.citizenProfile.deleteMany({ where: { userId } })
      await tx.governmentProfile.deleteMany({ where: { userId } })
      await tx.universityProfile.deleteMany({ where: { userId } })
      await tx.facultyProfile.deleteMany({ where: { userId } })
      await tx.industryProfile.deleteMany({ where: { userId } })
      await tx.communityConfirmation.deleteMany({ where: { citizenId: userId } })
      await tx.rubricEvaluation.deleteMany({ where: { evaluatorId: userId } })
      await tx.pilotCheckpoint.deleteMany({ where: { citizenId: userId } })
      await tx.user.delete({ where: { id: userId } })
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ADMIN_DELETE_USER',
        remarks: JSON.stringify({ deletedUserId: userId, deletedEmail: target.email, deletedName: target.name }),
      },
    })

    return NextResponse.json({ success: true, message: 'User account removed' })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json({ error: 'Failed to delete user account' }, { status: 500 })
  }
}
