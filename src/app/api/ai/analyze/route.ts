import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { classifyProblem, detectSimilarProblems } from '@/lib/ai'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, location, affectedPopulation, extraData } = await req.json()
  if (!title || !description) return Response.json({ error: 'title and description required' }, { status: 400 })

  // Run classification and fetch existing problems in parallel
  const [classification, existingProblems] = await Promise.all([
    classifyProblem(title, description, location || '', affectedPopulation, extraData),
    prisma.problem.findMany({
      select: { title: true, referenceId: true, category: true },
      take: 30,
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const similarProblems = await detectSimilarProblems(title, description, existingProblems)

  return Response.json({ classification, similarProblems })
}
