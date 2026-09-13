import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            members: true,
            problems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(organizations)
  } catch (error) {
    console.error('Failed to list organizations:', error)
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { name, code, type, state, district, department } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 })
    }

    const org = await prisma.organization.create({
      data: {
        name,
        code: code || `ORG-${Date.now().toString(36).toUpperCase()}`,
        type,
        state: state || null,
        district: district || null,
        department: department || null,
        status: 'APPROVED',
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ADMIN_CREATE_ORGANIZATION',
        remarks: JSON.stringify({ orgId: org.id, name: org.name, type: org.type }),
      },
    })

    return NextResponse.json({ success: true, organization: org })
  } catch (error) {
    console.error('Failed to create organization:', error)
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }
}
