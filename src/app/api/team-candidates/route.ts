import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')

    const where: any = {
      role: { in: ['CITIZEN', 'FACULTY', 'UNIVERSITY'] },
      accountStatus: { not: 'SUSPENDED' },
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }

    const candidates = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        citizen: {
          select: { city: true, state: true },
        },
        faculty: {
          select: { department: true, university: true, expertise: true },
        },
      },
      take: 50,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(candidates)
  } catch (error: any) {
    console.error('Failed to list team candidates:', error)
    return NextResponse.json({ error: 'Failed to fetch team candidates' }, { status: 500 })
  }
}
