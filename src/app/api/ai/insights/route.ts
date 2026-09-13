import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { generateDashboardInsights } from '@/lib/ai'
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
