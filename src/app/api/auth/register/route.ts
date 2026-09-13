import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      email,
      password,
      role,
      department,
      authority,
      university,
      company,
      jurisdiction,
      designation,
      discipline,   // University/Faculty: e.g. "Civil Engineering"
      expertise,    // Faculty only
      sector,       // Industry sector
      industryType, // SME | Large Enterprise | Startup | MNC
    } = body

    if (!name || !email || !password || !role) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validRoles = ['CITIZEN', 'GOVERNMENT', 'UNIVERSITY', 'FACULTY', 'INDUSTRY']
    if (!validRoles.includes(role)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return Response.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Citizens may use the platform immediately.
    // Institutional accounts start as PENDING until verified by an Admin.
    const accountStatus = role === 'CITIZEN' ? 'APPROVED' : 'PENDING'

    const profileData: any = {}
    if (role === 'CITIZEN') {
      profileData.citizen = { create: { city: 'City', state: 'State' } }
    } else if (role === 'GOVERNMENT') {
      profileData.government = {
        create: {
          authority: authority || 'Municipal Authority',
          department: department || 'Urban Development',
          jurisdiction: jurisdiction || 'District Jurisdiction',
          designation: designation || 'Officer',
        },
      }
    } else if (role === 'UNIVERSITY') {
      profileData.university = {
        create: {
          university: university || 'Partner University',
          department: discipline || department || 'Innovation & Research',
          designation: designation || 'Coordinator',
        },
      }
    } else if (role === 'FACULTY') {
      profileData.faculty = {
        create: {
          university: university || 'Partner University',
          department: discipline || department || 'Engineering',
          expertise: expertise || undefined,
          designation: designation || 'Assistant Professor',
        },
      }
    } else if (role === 'INDUSTRY') {
      // Combine sector + industry type for rich context
      const combinedSector = [sector, industryType].filter(Boolean).join(' — ') || 'Technology & Infrastructure'
      profileData.industry = {
        create: {
          company: company || 'Industry Partner',
          sector: combinedSector,
        },
      }
    }


    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        accountStatus,
        ...profileData,
      },
    })

    return Response.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        message:
          accountStatus === 'PENDING'
            ? 'Account registered successfully! Your institutional account is pending Admin approval.'
            : 'Account registered successfully!',
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('Registration error:', err)
    return Response.json({ error: err.message || 'Registration failed' }, { status: 500 })
  }
}
