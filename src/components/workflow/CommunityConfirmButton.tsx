'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Users, Check } from 'lucide-react'

interface Props {
  problemId: string
  initialCount?: number
  initialConfirmed?: boolean
}

export function CommunityConfirmButton({ problemId, initialCount = 0, initialConfirmed = false }: Props) {
  const { data: session } = useSession()
  const [count, setCount] = useState(initialCount)
  const [confirmed, setConfirmed] = useState(initialConfirmed)
  const [loading, setLoading] = useState(false)

  // Only citizens see and use the +1 community affected confirmation
  if (session?.user?.role && session.user.role !== 'CITIZEN') {
    return null
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session?.user) {
      alert('Please sign in as a citizen to confirm this problem.')
      return
    }

    // Optimistic update
    const prevConfirmed = confirmed
    const prevCount = count
    setConfirmed(!prevConfirmed)
    setCount(prevConfirmed ? Math.max(0, count - 1) : count + 1)
    setLoading(true)

    try {
      const res = await fetch(`/api/problems/${problemId}/community-confirm`, {
        method: 'POST',
      })
      if (!res.ok) {
        throw new Error('Failed to update confirmation')
      }
      const data = await res.json()
      setCount(data.count)
      setConfirmed(data.hasConfirmed)
    } catch (err) {
      console.error(err)
      setConfirmed(prevConfirmed)
      setCount(prevCount)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
        confirmed
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
          : 'bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-300'
      }`}
      title={confirmed ? 'Click to withdraw your community confirmation' : 'Click if this problem affects you too'}
    >
      {confirmed ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>Affected Too (+1)</span>
        </>
      ) : (
        <>
          <Users className="w-3.5 h-3.5" />
          <span>+1 (I'm Affected Too)</span>
        </>
      )}
      <span
        className={`ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
          confirmed ? 'bg-emerald-800 text-emerald-100' : 'bg-indigo-100 text-indigo-800'
        }`}
      >
        {count}
      </span>
    </button>
  )
}
