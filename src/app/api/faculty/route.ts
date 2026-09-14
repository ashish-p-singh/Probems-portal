import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const facultyUsers = await prisma.user.findMany({
      where: {
        role: 'FACULTY',
        accountStatus: { not: 'SUSPENDED' },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        accountStatus: true,
        faculty: {
          select: {
            id: true,
            university: true,
            department: true,
            expertise: true,
            designation: true,
          },
        },
        facultyAssignments: {
          select: {
            id: true,
            projectId: true,
            project: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(facultyUsers)
  } catch (error: any) {
    console.error('Failed to list faculty:', error)
    return NextResponse.json({ error: 'Failed to fetch faculty list' }, { status: 500 })
  }
}
