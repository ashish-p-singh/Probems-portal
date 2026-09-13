import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { generateDashboardInsights, generateWelcomeInsight } from '@/lib/ai'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const problems = await prisma.problem.findMany({
    select: { status: true, category: true, aiSeverity: true, location: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const insights = await generateDashboardInsights(
    problems.map(p => ({
      status: p.status,
      category: p.category,
      severity: p.aiSeverity,
      location: p.location,
      createdAt: p.createdAt.toISOString(),
    }))
  )

  return Response.json(insights)
}

// POST: personalised welcome insight for any user based on their own data
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { role, name, department, discipline, sector, company, university, problems } = body

    if (!problems || !Array.isArray(problems) || problems.length === 0) {
      return Response.json(null)
    }

    const insight = await generateWelcomeInsight({
      role: role || session.user.role,
      name: name || session.user.name,
      department: department || session.user.department,
      discipline: discipline || session.user.discipline,
      sector: sector || session.user.sector,
      company: company || session.user.company,
      university: university || session.user.university,
      problems,
    })

    return Response.json(insight)
  } catch (err: any) {
    console.error('Welcome insight error:', err)
    return Response.json(null)
  }
}

