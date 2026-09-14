'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle, Building2, GraduationCap, Factory, User, ChevronDown, Clock, ArrowRight } from 'lucide-react'

const roles = [
  { value: 'CITIZEN', label: 'Citizen', icon: '🏘️', desc: 'Report civic problems in your area' },
  { value: 'GOVERNMENT', label: 'Government Officer', icon: '🏛️', desc: 'Verify and manage civic problems for your department' },
  { value: 'UNIVERSITY', label: 'University Administrator', icon: '🎓', desc: 'Accept problems and manage research projects' },
  { value: 'FACULTY', label: 'Faculty Leader', icon: '👨‍🏫', desc: 'Lead multidisciplinary teams to solve civic problems' },
  { value: 'INDUSTRY', label: 'Industry Partner', icon: '🏭', desc: 'Collaborate on government-approved civic solutions' },
]

const GOV_DEPARTMENTS = [
  'Public Works Department (PWD)',
  'Water & Sanitation',
  'Electricity & Power',
  'Urban Development',
  'Health & Medical Services',
  'Roads & Transport',
  'Revenue Department',
  'Education Department',
  'Environment & Forests',
  'Agriculture',
  'Rural Development',
  'Police & Safety',
]

const DISCIPLINES = [
  'Civil Engineering',
  'Structural Engineering',
  'Environmental Engineering',
  'Computer Science & Engineering',
  'Software Engineering',
  'Information Technology',
  'Electrical Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Chemical Engineering',
  'Biomedical Engineering',
  'Medical & Health Sciences',
  'Architecture & Urban Planning',
  'Water Resources Engineering',
  'Agricultural Engineering',
  'Biotechnology',
  'Management & Administration',
  'Social Sciences',
  'Law & Policy',
  'Other',
]

const INDUSTRY_SECTORS = [
  'Technology & Software',
  'Construction & Infrastructure',
  'Healthcare & Pharma',
  'Agriculture & Food',
  'Energy & Power',
  'Water & Sanitation',
  'Transport & Logistics',
  'Environment & Green Tech',
  'Education & EdTech',
  'Finance & Banking',
  'Manufacturing',
  'Telecommunications',
  'Other',
]

const INDUSTRY_TYPES = [
  'Startup',
  'SME (Small & Medium Enterprise)',
  'Large Enterprise',
  'MNC (Multinational Corporation)',
  'Public Sector Undertaking (PSU)',
  'NGO / Non-Profit',
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
    // Government
    department: '',
    authority: '',
    jurisdiction: '',
    designation: '',
    // University / Faculty
    university: '',
    discipline: '',
    expertise: '',
    // Industry
    company: '',
    sector: '',
    industryType: '',
  })

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const selectedRole = roles.find((r) => r.value === form.role)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Client-side validation of role-specific required fields
    if (form.role === 'GOVERNMENT') {
      if (!form.department || !form.authority || !form.jurisdiction) {
        setError('Please fill in all Government details (authority, department, and jurisdiction).')
        setLoading(false)
        return
      }
    }
    if (form.role === 'UNIVERSITY' || form.role === 'FACULTY') {
      if (!form.university || !form.discipline) {
        setError('Please fill in your university name and discipline.')
        setLoading(false)
        return
      }
    }
    if (form.role === 'INDUSTRY') {
      if (!form.company || !form.sector || !form.industryType) {
        setError('Please fill in your company name, sector, and industry type.')
        setLoading(false)
        return
      }
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Registration failed')
      setSuccess(true)
      if (form.role === 'CITIZEN') {
        setTimeout(() => router.push('/login'), 2000)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    const isApprovalRequired = form.role !== 'CITIZEN'

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="card p-8 sm:p-10 text-center max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl">
          {isApprovalRequired ? (
            <>
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-200 dark:border-amber-800">
                <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-pulse" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 mb-3">
                Approval Required
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Registration Submitted!</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                Your <span className="font-semibold text-slate-900 dark:text-white">{selectedRole?.label}</span> account requires administrative verification. Please wait for confirmation by a Platform Administrator before logging in.
              </p>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400 text-left space-y-2 border border-slate-200/80 dark:border-slate-800 mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Institutional accounts undergo verification to ensure credentials and authorized authority.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Once confirmed, you will be able to log in with your email <span className="font-semibold text-slate-700 dark:text-slate-200">{form.email}</span>.</span>
                </div>
              </div>
              <Link
                href="/login"
                className="btn-primary w-full justify-center py-2.5 flex items-center gap-2"
              >
                Go to Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Account Ready!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Your Citizen account is active. Redirecting you to sign in...
              </p>
              <Link
                href="/login"
                className="btn-primary w-full justify-center py-2.5 flex items-center gap-2"
              >
                Sign In Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SIH</span>
          </div>
          <span className="font-bold text-slate-900">SIH 26043</span>
          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">Prototype</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">Create account</h1>
        <p className="text-slate-500 text-sm mb-6">Join the platform to report or solve civic problems</p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Basic Info ── */}
          <div className="card p-5 space-y-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Basic Information</p>
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
          </div>

          {/* ── Role Selection ── */}
          <div className="card p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your Role</p>
            <div className="grid grid-cols-1 gap-2">
              {roles.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    form.role === r.value
                      ? 'border-indigo-400 bg-indigo-50/60'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={form.role === r.value}
                    onChange={(e) => set('role', e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-xl">{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${form.role === r.value ? 'text-indigo-800' : 'text-slate-800'}`}>{r.label}</p>
                    <p className="text-xs text-slate-500 leading-snug">{r.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                    form.role === r.value ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                  }`}>
                    {form.role === r.value && <div className="w-full h-full rounded-full bg-white scale-50" />}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* ── Government Fields ── */}
          {form.role === 'GOVERNMENT' && (
            <div className="card p-5 space-y-4 border-indigo-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Government Details <span className="text-red-500">*</span></p>
              </div>
              <div>
                <label className="label">Government Authority / Body</label>
                <input className="input" value={form.authority} onChange={(e) => set('authority', e.target.value)} required placeholder="e.g. Greater Mumbai Municipal Corporation" />
              </div>
              <div>
                <label className="label">Department</label>
                <select className="select" value={form.department} onChange={(e) => set('department', e.target.value)} required>
                  <option value="">Select your department</option>
                  {GOV_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <p className="text-xs text-slate-400 mt-1">This is used to personalise which civic problems appear on your dashboard.</p>
              </div>
              <div>
                <label className="label">Jurisdiction / Area</label>
                <input className="input" value={form.jurisdiction} onChange={(e) => set('jurisdiction', e.target.value)} required placeholder="e.g. Mumbai North District" />
              </div>
              <div>
                <label className="label">Designation <span className="text-slate-400">(optional)</span></label>
                <input className="input" value={form.designation} onChange={(e) => set('designation', e.target.value)} placeholder="e.g. Deputy Commissioner, Junior Engineer" />
              </div>
            </div>
          )}

          {/* ── University / Faculty Fields ── */}
          {(form.role === 'UNIVERSITY' || form.role === 'FACULTY') && (
            <div className="card p-5 space-y-4 border-violet-200">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-violet-600" />
                <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide">Academic Details <span className="text-red-500">*</span></p>
              </div>
              <div>
                <label className="label">University / Institution Name</label>
                <input className="input" value={form.university} onChange={(e) => set('university', e.target.value)} required placeholder="e.g. IIT Bombay, NIT Surat" />
              </div>
              <div>
                <label className="label">Department / Discipline</label>
                <select className="select" value={form.discipline} onChange={(e) => set('discipline', e.target.value)} required>
                  <option value="">Select your discipline</option>
                  {DISCIPLINES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <p className="text-xs text-slate-400 mt-1">AI will use this to show you problems that match your discipline.</p>
              </div>
              <div>
                <label className="label">Designation <span className="text-slate-400">(optional)</span></label>
                <input className="input" value={form.designation} onChange={(e) => set('designation', e.target.value)} placeholder={form.role === 'FACULTY' ? 'e.g. Associate Professor, HOD' : 'e.g. Research Coordinator'} />
              </div>
              {form.role === 'FACULTY' && (
                <div>
                  <label className="label">Area of Expertise <span className="text-slate-400">(optional)</span></label>
                  <input className="input" value={form.expertise} onChange={(e) => set('expertise', e.target.value)} placeholder="e.g. Structural Analysis, IoT Systems, Water Treatment" />
                </div>
              )}
            </div>
          )}

          {/* ── Industry Fields ── */}
          {form.role === 'INDUSTRY' && (
            <div className="card p-5 space-y-4 border-emerald-200">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Industry Details <span className="text-red-500">*</span></p>
              </div>
              <div>
                <label className="label">Company / Organisation Name</label>
                <input className="input" value={form.company} onChange={(e) => set('company', e.target.value)} required placeholder="e.g. Tata Projects Ltd, Infosys BPM" />
              </div>
              <div>
                <label className="label">Industry Sector</label>
                <select className="select" value={form.sector} onChange={(e) => set('sector', e.target.value)} required>
                  <option value="">Select your sector</option>
                  {INDUSTRY_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <p className="text-xs text-slate-400 mt-1">Used to match you with relevant government-approved projects.</p>
              </div>
              <div>
                <label className="label">Industry Type</label>
                <select className="select" value={form.industryType} onChange={(e) => set('industryType', e.target.value)} required>
                  <option value="">Select industry type</option>
                  {INDUSTRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          {/* ── Pending note for institutional ── */}
          {form.role !== 'CITIZEN' && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              ⏳ Institutional accounts require Admin approval before you can log in. You will be notified once approved.
            </p>
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
