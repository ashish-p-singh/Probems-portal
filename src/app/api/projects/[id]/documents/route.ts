import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, ctx: RouteContext<'/api/projects/[id]/documents'>) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: projectId } = await ctx.params

  const project = await prisma.universityProject.findUnique({
    where: { id: projectId },
  })
  if (!project) return Response.json({ error: 'Project not found' }, { status: 404 })

  const body = await req.json()
  const { title, fileUrl, fileName, fileType, documentType = 'report' } = body

  if (!title || !fileUrl || !fileName) {
    return Response.json({ error: 'title, fileUrl, and fileName are required' }, { status: 400 })
  }

  const document = await prisma.document.create({
    data: {
      projectId,
      title,
      fileUrl,
      fileName,
      fileType: fileType || 'application/pdf',
      documentType,
      uploadedById: session.user.id,
    },
    include: {
      uploadedBy: { select: { name: true, role: true } },
    },
  })

  // Audit log
  await prisma.auditLog.create({
    data: {
      problemId: project.problemId,
      userId: session.user.id,
      action: 'Document Uploaded',
      remarks: `Uploaded "${title}" (${documentType})`,
    },
  })

  return Response.json(document, { status: 201 })
}
