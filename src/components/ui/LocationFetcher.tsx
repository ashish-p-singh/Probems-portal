'use client'

import { useState } from 'react'
import { MapPin, Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react'

export interface LocationData {
  location: string
  municipality: string
  panchayat: string
  district: string
  state: string
  postcode?: string
  displayName?: string
  lat?: number
  lng?: number
}

interface LocationFetcherProps {
  onLocationFetched: (data: LocationData) => void
  className?: string
}

export function LocationFetcher({ onLocationFetched, className = '' }: LocationFetcherProps) {
  const [loading, setLoading] = useState(false)
  const [detectedText, setDetectedText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchLocation = () => {
    setLoading(true)
    setError(null)

    const handleSuccess = async (lat?: number, lng?: number) => {
      try {
        const query = lat !== undefined && lng !== undefined ? `?lat=${lat}&lng=${lng}` : ''
        const res = await fetch(`/api/location/reverse${query}`)
        const data = await res.json()

        if (!res.ok || data.error) {
          throw new Error(data.error || 'Failed to detect location')
        }

        const summary = [data.location, data.municipality || data.district, data.state]
          .filter(Boolean)
          .join(', ')

        setDetectedText(summary || data.displayName || 'Location detected')
        onLocationFetched({
          location: data.location || '',
          municipality: data.municipality || '',
          panchayat: data.panchayat || '',
          district: data.district || '',
          state: data.state || '',
          postcode: data.postcode || '',
          displayName: data.displayName || '',
          lat: data.lat,
          lng: data.lng,
        })
      } catch (err: any) {
        setError(err.message || 'Error fetching location details')
      } finally {
        setLoading(false)
      }
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleSuccess(position.coords.latitude, position.coords.longitude)
        },
        (geoError) => {
          console.warn('Browser geolocation failed or denied, trying IP fallback:', geoError.message)
          // Fallback to IP-based location
          handleSuccess()
        },
        { timeout: 10000, enableHighAccuracy: true }
      )
    } else {
      // No browser geolocation, try IP fallback
      handleSuccess()
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={fetchLocation}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Fetching exact location…</span>
            </>
          ) : detectedText ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              <span>Refresh Location</span>
            </>
          ) : (
            <>
              <MapPin className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>Detect Current Location (GPS)</span>
            </>
          )}
        </button>

        {detectedText && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Auto-filled: <span className="font-semibold">{detectedText}</span>
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}. You can still enter details manually.</span>
        </div>
      )}
    </div>
  )
}
