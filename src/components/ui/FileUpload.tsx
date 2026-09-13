'use client'

import { useState, useRef } from 'react'
import { UploadCloud, File, Image as ImageIcon, X, Loader2, CheckCircle, AlertCircle, Camera } from 'lucide-react'
import { CameraCaptureModal } from './CameraCaptureModal'

export interface UploadedFile {
  url: string
  fileName: string
  fileType: string
  size: number
}

interface FileUploadProps {
  label?: string
  hint?: string
  accept?: string
  multiple?: boolean
  maxSizeMB?: number
  enableCamera?: boolean
  onFilesChange: (files: UploadedFile[]) => void
  initialFiles?: UploadedFile[]
  className?: string
}

export function FileUpload({
  label = 'Upload Files & Attachments',
  hint = 'Supports photos (JPG, PNG, WebP) and documents (PDF, DOCX) up to 15MB',
  accept = 'image/*,.pdf,.doc,.docx,.txt',
  multiple = true,
  maxSizeMB = 15,
  enableCamera = true,
  onFilesChange,
  initialFiles = [],
  className = '',
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return
    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      Array.from(selectedFiles).forEach((f) => {
        if (f.size > maxSizeMB * 1024 * 1024) {
          throw new Error(`"${f.name}" is larger than ${maxSizeMB}MB`)
        }
        formData.append('files', f)
      })

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Upload failed')
      }

      const newlyUploaded: UploadedFile[] = data.files || (data.file ? [data.file] : [])
      const updated = multiple ? [...files, ...newlyUploaded] : newlyUploaded
      setFiles(updated)
      onFilesChange(updated)
    } catch (err: any) {
      setError(err.message || 'Failed to upload files')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handlePhotoCaptured = (photo: UploadedFile) => {
    const updated = multiple ? [...files, photo] : [photo]
    setFiles(updated)
    onFilesChange(updated)
  }

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    onFilesChange(updated)
  }

  const formatSize = (bytes: number) => {
    if (!bytes) return ''
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        {label && <label className="label block mb-0">{label}</label>}

        {enableCamera && (
          <button
            type="button"
            onClick={() => setCameraOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-sm"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-600" />
            <span>Open Camera to Snap Photo</span>
          </button>
        )}
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          handleUpload(e.dataTransfer.files)
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-11 h-11 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shadow-sm">
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UploadCloud className="w-5 h-5" />
            )}
          </div>

          <div className="text-sm text-slate-600">
            <span className="font-semibold text-indigo-600 hover:underline">
              {uploading ? 'Uploading files…' : 'Click to browse files'}
            </span>{' '}
            {!uploading && 'or drag and drop here'}
          </div>

          <p className="text-xs text-slate-400">{hint}</p>

          {enableCamera && !uploading && (
            <div className="pt-2">
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  setCameraOpen(true)
                }}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                Or click here to take a live photo
              </span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Attached Files ({files.length})
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {files.map((file, idx) => {
              const isImg = file.fileType?.startsWith('image/')
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 group hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                    {isImg ? (
                      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-slate-200 bg-white">
                        <img
                          src={file.url}
                          alt={file.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600 border border-indigo-100">
                        <File className="w-5 h-5" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-800 truncate" title={file.fileName}>
                        {file.fileName}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span>{formatSize(file.size)}</span>
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" /> Ready
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(idx)
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Live Camera Modal */}
      <CameraCaptureModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
      />
    </div>
  )
}
