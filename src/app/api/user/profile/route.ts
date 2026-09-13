import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true,
        themePreference: true,
        avatar: true,
        createdAt: true,
        citizen: true,
        government: true,
        university: true,
        faculty: true,
        industry: true,
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      email,
      themePreference,
      currentPassword,
      newPassword,
      // Role specific fields
      citizen,
      government,
      university,
      faculty,
      industry,
    } = body

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Password change check if requested
    let updatedPasswordHash: string | undefined
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 })
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password)
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
      }
      updatedPasswordHash = await bcrypt.hash(newPassword, 10)
    }

    // Email collision check if changing email
    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json({ error: 'Email address already in use by another account' }, { status: 400 })
      }
    }

    // Update User core record
    const updatedUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: user.id },
        data: {
          name: name || user.name,
          email: email || user.email,
          ...(themePreference ? { themePreference } : {}),
          ...(updatedPasswordHash ? { password: updatedPasswordHash } : {}),
        },
      })

      // Upsert role profile
      if (user.role === 'CITIZEN' && citizen) {
        await tx.citizenProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            phone: citizen.phone || null,
            address: citizen.address || null,
            city: citizen.city || null,
            state: citizen.state || null,
          },
          update: {
            phone: citizen.phone || null,
            address: citizen.address || null,
            city: citizen.city || null,
            state: citizen.state || null,
          },
        })
      } else if (user.role === 'GOVERNMENT' && government) {
        await tx.governmentProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            authority: government.authority || 'Municipality',
            department: government.department || null,
            jurisdiction: government.jurisdiction || null,
            designation: government.designation || null,
          },
          update: {
            authority: government.authority || 'Municipality',
            department: government.department || null,
            jurisdiction: government.jurisdiction || null,
            designation: government.designation || null,
          },
        })
      } else if (user.role === 'UNIVERSITY' && university) {
        await tx.universityProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            university: university.university || 'State University',
            department: university.department || null,
            designation: university.designation || null,
          },
          update: {
            university: university.university || 'State University',
            department: university.department || null,
            designation: university.designation || null,
          },
        })
      } else if (user.role === 'FACULTY' && faculty) {
        await tx.facultyProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            university: faculty.university || 'State University',
            department: faculty.department || 'Engineering',
            expertise: faculty.expertise || null,
            designation: faculty.designation || null,
          },
          update: {
            university: faculty.university || 'State University',
            department: faculty.department || 'Engineering',
            expertise: faculty.expertise || null,
            designation: faculty.designation || null,
          },
        })
      } else if (user.role === 'INDUSTRY' && industry) {
        await tx.industryProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            company: industry.company || 'Enterprise Partner',
            sector: industry.sector || null,
            website: industry.website || null,
          },
          update: {
            company: industry.company || 'Enterprise Partner',
            sector: industry.sector || null,
            website: industry.website || null,
          },
        })
      }

      return u
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
