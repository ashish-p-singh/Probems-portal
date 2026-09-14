import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email) {
      return Response.json({ status: 'UNKNOWN' })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim() },
      select: {
        id: true,
        role: true,
        accountStatus: true,
        password: true,
      },
    })

    if (!user) {
      return Response.json({ status: 'NOT_FOUND' })
    }

    // If password is provided, verify it so we only reveal status for valid credentials
    if (password) {
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return Response.json({ status: 'INVALID_CREDENTIALS' })
      }
    }

    return Response.json({
      status: user.accountStatus || 'APPROVED',
      role: user.role,
    })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
