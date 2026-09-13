'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

const demoAccounts = [
  { role: 'Admin', email: 'admin@demo.sih', color: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' },
  { role: 'Citizen', email: 'citizen@demo.sih', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
  { role: 'Government', email: 'govt@demo.sih', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { role: 'University', email: 'university@demo.sih', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
  { role: 'Faculty', email: 'faculty@demo.sih', color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
  { role: 'Industry', email: 'industry@demo.sih', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
]

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const fillDemo = (role: string, demoEmail: string) => {
    setSelectedRole(role)
    setEmail(demoEmail)
    setPassword('demo1234')
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 dark:bg-indigo-900 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SIH</span>
            </div>
            <span className="text-white font-bold tracking-tight">SIH 26043</span>
            <span className="text-xs text-indigo-200 bg-white/10 px-2 py-0.5 rounded-full">Prototype</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-snug">
            Civic problems.<br />University solutions.<br />Real impact.
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed">
            A structured platform connecting citizens, government, universities and industry to solve India&apos;s real-world problems.
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-indigo-300 text-xs uppercase tracking-wider font-medium">Workflow</p>
          {[
            'Citizen reports problem',
            'Government verifies',
            'University accepts & forms team',
            'Faculty Leader guides solution',
            'Government validates solution',
            'Industry collaborates',
            'Impact measured',
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-indigo-100 text-sm">
              <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">{i + 1}</span>
              </div>
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SIH</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">SIH 26043</span>
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">Prototype</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Sign in</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Access your role-based dashboard</p>

          {/* Demo quick login */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Select Demo Role</p>
              {selectedRole && (
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Active: {selectedRole}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((d) => {
                const isSelected = selectedRole === d.role
                return (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => fillDemo(d.role, d.email)}
                    className={`relative px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 border ${
                      isSelected
                        ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 ring-offset-2 dark:ring-offset-slate-950 bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.03]'
                        : `${d.color} border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 hover:scale-[1.01]`
                    }`}
                  >
                    {isSelected && <span className="text-white font-black text-xs">✓</span>}
                    <span>{d.role}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Register
            </Link>
          </p>

          <div className="mt-8 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-500 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-200">Demo password:</strong> demo1234 for all accounts
          </div>
        </div>
      </div>
    </div>
  )
}
