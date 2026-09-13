import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    // If no coordinates provided, try IP-based geolocation fallback
    try {
      const ipRes = await fetch('https://ipapi.co/json/', {
        headers: { 'User-Agent': 'SIH-26043/1.0' },
      })
      if (ipRes.ok) {
        const ipData = await ipRes.json()
        return Response.json({
          success: true,
          location: ipData.city ? `${ipData.city}, ${ipData.region}` : '',
          municipality: ipData.city || '',
          panchayat: '',
          district: ipData.city || '',
          state: ipData.region || '',
          postcode: ipData.postal || '',
          lat: ipData.latitude,
          lng: ipData.longitude,
          source: 'ip',
        })
      }
    } catch (err) {
      console.error('IP geocoding fallback failed:', err)
    }

    return Response.json({ error: 'lat and lng parameters are required' }, { status: 400 })
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}&addressdetails=1`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SIH-26043-App/1.0 (support@sih26043.org)',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
    })

    if (!res.ok) {
      throw new Error(`Reverse geocode failed with status ${res.status}`)
    }

    const data = await res.json()
    const addr = data.address || {}

    // Extract cleanest address components
    const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || ''
    const area = addr.suburb || addr.neighbourhood || addr.residential || ''
    const city = addr.city || addr.town || addr.municipality || addr.village || ''
    const stateDistrict = addr.state_district || addr.county || addr.district || city
    const state = addr.state || ''
    const postcode = addr.postcode || ''

    // Construct specific landmark/location string
    const locationParts = [road, area].filter(Boolean)
    const specificLocation = locationParts.length > 0 
      ? locationParts.join(', ')
      : (data.display_name ? data.display_name.split(',').slice(0, 2).join(', ').trim() : '')

    return Response.json({
      success: true,
      location: specificLocation,
      municipality: addr.municipality || city,
      panchayat: addr.village || addr.hamlet || '',
      district: stateDistrict,
      state: state,
      postcode: postcode,
      displayName: data.display_name,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      source: 'gps',
    })
  } catch (error: any) {
    console.error('Reverse geocode error:', error)
    return Response.json(
      { error: error.message || 'Failed to reverse geocode location' },
      { status: 500 }
    )
  }
}
