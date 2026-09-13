'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle } from 'lucide-react'

const roles = [
  { value: 'CITIZEN', label: 'Citizen' },
  { value: 'GOVERNMENT', label: 'Government Officer' },
  { value: 'UNIVERSITY', label: 'University Admin' },
  { value: 'FACULTY', label: 'Faculty Leader' },
  { value: 'INDUSTRY', label: 'Industry Partner' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CITIZEN',
  })

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Registration failed')
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="card p-10 text-center max-w-sm w-full">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Account Created</h2>
          <p className="text-slate-500 text-sm">Redirecting to login…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SIH</span>
          </div>
          <span className="font-bold text-slate-900">SIH 26043</span>
          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">Prototype</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">Create account</h1>
        <p className="text-slate-500 text-sm mb-8">Join the platform to report or solve civic problems</p>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Your full name" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={8} placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="select" value={form.role} onChange={(e) => set('role', e.target.value)}>
              {roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-sm">
              <AlertCircle className="w-4 h-4" />{error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
