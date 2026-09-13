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
    const action = searchParams.get('action')
    const query = searchParams.get('q')

    const where: any = {}
    if (action && action !== 'ALL') where.action = action
    if (query) {
      where.OR = [
        { action: { contains: query, mode: 'insensitive' } },
        { remarks: { contains: query, mode: 'insensitive' } },
        { user: { name: { contains: query, mode: 'insensitive' } } },
        { user: { email: { contains: query, mode: 'insensitive' } } },
      ]
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
        problem: {
          select: { title: true, referenceId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Failed to list audit logs:', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
