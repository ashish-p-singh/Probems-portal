'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X, RefreshCw, Check, AlertCircle, Loader2, Sparkles, SwitchCamera } from 'lucide-react'
import { UploadedFile } from './FileUpload'

interface CameraCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onPhotoCaptured: (file: UploadedFile) => void
}

export function CameraCaptureModal({ isOpen, onClose, onPhotoCaptured }: CameraCaptureModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nativeCameraRef = useRef<HTMLInputElement>(null)

  // Start camera when modal opens or facingMode changes
  useEffect(() => {
    if (!isOpen) {
      stopCamera()
      setCapturedImage(null)
      setError(null)
      return
    }

    startCamera()

    // Check if device has multiple video devices (front and back)
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput')
        setHasMultipleCameras(videoInputs.length > 1)
      }).catch(() => {})
    }

    return () => {
      stopCamera()
    }
  }, [isOpen, facingMode])

  const startCamera = async () => {
    stopCamera()
    setError(null)

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser.')
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })

      setStream(newStream)
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
    } catch (err: any) {
      console.warn('getUserMedia error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission was denied. Please allow camera access in browser settings.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera device detected on this system.')
      } else {
        setError('Unable to access camera: ' + (err.message || 'Unknown error'))
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    setCapturedImage(dataUrl)
    stopCamera()
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  const uploadCapturedPhoto = async () => {
    if (!capturedImage) return
    setUploading(true)
    setError(null)

    try {
      // Convert dataUrl to blob
      const res = await fetch(capturedImage)
      const blob = await res.blob()

      const fileName = `camera_photo_${Date.now()}.jpg`
      const file = new File([blob], fileName, { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await uploadRes.json()
      if (!uploadRes.ok || data.error) {
        throw new Error(data.error || 'Failed to upload photo')
      }

      const uploaded: UploadedFile = data.file || (data.files && data.files[0])
      onPhotoCaptured(uploaded)
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleNativeCamera = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to upload photo')
      }

      const uploaded: UploadedFile = data.file || (data.files && data.files[0])
      onPhotoCaptured(uploaded)
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Failed to upload captured photo')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    stopCamera()
    setCapturedImage(null)
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Live Camera Capture</h3>
              <p className="text-[11px] text-slate-400">Take a photo of the civic issue or solution</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative aspect-video sm:aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Frame overlay */}
              {!error && (
                <div className="absolute inset-6 border border-white/30 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
                  </div>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-indigo-400" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Hidden Canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Hidden Native Camera Input (Mobile capture) */}
          <input
            ref={nativeCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleNativeCamera}
          />

          {/* Flip camera button (if multiple cameras) */}
          {!capturedImage && !error && hasMultipleCameras && (
            <button
              type="button"
              onClick={switchCamera}
              className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition-all"
              title="Flip camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          )}

          {/* Error Banner */}
          {error && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <div className="max-w-xs space-y-1">
                <p className="text-sm font-medium text-white">Camera Access Error</p>
                <p className="text-xs text-slate-400">{error}</p>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => nativeCameraRef.current?.click()}
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold rounded-lg text-white transition-colors"
                >
                  Use Device Camera App
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-300 transition-colors"
                >
                  Retry Camera
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={retakePhoto}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retake
              </button>

              <button
                type="button"
                onClick={uploadCapturedPhoto}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading Photo…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Use & Upload Photo
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => nativeCameraRef.current?.click()}
                className="text-xs text-slate-400 hover:text-white transition-colors underline"
              >
                Use native camera
              </button>

              <div className="flex-1 flex justify-center">
                <button
                  type="button"
                  onClick={takePhoto}
                  disabled={!stream || !!error}
                  className="w-14 h-14 rounded-full border-4 border-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-indigo-900/50 disabled:opacity-40 disabled:pointer-events-none"
                  title="Snap Photo"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
