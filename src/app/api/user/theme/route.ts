import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ themePreference: 'light' })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { themePreference: true },
    })

    return NextResponse.json({ themePreference: user?.themePreference || 'light' })
  } catch (error) {
    console.error('Error fetching theme preference:', error)
    return NextResponse.json({ themePreference: 'light' })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { themePreference } = body

    if (!['light', 'dark', 'system'].includes(themePreference)) {
      return NextResponse.json({ error: 'Invalid theme value' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { themePreference },
      select: { id: true, themePreference: true },
    })

    return NextResponse.json({ success: true, themePreference: updated.themePreference })
  } catch (error) {
    console.error('Error saving theme preference:', error)
    return NextResponse.json({ error: 'Failed to update theme preference' }, { status: 500 })
  }
}
