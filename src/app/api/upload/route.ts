import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { auth } from '@/lib/auth'

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
]

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const singleFile = formData.get('file') as File | null

    const allFiles = files.length > 0 ? files : (singleFile ? [singleFile] : [])

    if (allFiles.length === 0) {
      return Response.json({ error: 'No files provided for upload' }, { status: 400 })
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const uploadedResults = []

    for (const file of allFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return Response.json(
          { error: `File "${file.name}" exceeds maximum allowed size of 15MB` },
          { status: 400 }
        )
      }

      if (file.type && !ALLOWED_TYPES.includes(file.type)) {
        return Response.json(
          { error: `File type "${file.type}" for "${file.name}" is not supported` },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Clean file name
      const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : ''
      const rawBase = file.name.substring(0, file.name.lastIndexOf('.') > 0 ? file.name.lastIndexOf('.') : file.name.length)
      const cleanBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanBase}${ext}`

      const filePath = join(uploadsDir, uniqueName)
      await writeFile(filePath, buffer)

      const fileUrl = `/uploads/${uniqueName}`

      uploadedResults.push({
        url: fileUrl,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        size: file.size,
      })
    }

    return Response.json({
      success: true,
      files: uploadedResults,
      // For single file convenience:
      file: uploadedResults[0],
    })
  } catch (error: any) {
    console.error('File upload error:', error)
    return Response.json({ error: error.message || 'File upload failed' }, { status: 500 })
  }
}
