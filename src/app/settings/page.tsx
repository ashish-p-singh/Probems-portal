'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardShell } from '@/components/layout/Sidebar'
import {
  User, Shield, Lock, Palette, CheckCircle2, AlertCircle,
  Building2, Phone, MapPin, Briefcase, GraduationCap, Globe, Save
} from 'lucide-react'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [activeTab, setActiveTab] = useState<'profile' | 'role' | 'theme' | 'security'>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [accountStatus, setAccountStatus] = useState('')
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system')

  // Passwords
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Role Profile Objects
  const [citizen, setCitizen] = useState<any>({ phone: '', address: '', city: '', state: '' })
  const [government, setGovernment] = useState<any>({ authority: '', department: '', jurisdiction: '', designation: '' })
  const [university, setUniversity] = useState<any>({ university: '', department: '', designation: '' })
  const [faculty, setFaculty] = useState<any>({ university: '', department: '', expertise: '', designation: '' })
  const [industry, setIndustry] = useState<any>({ company: '', sector: '', website: '' })

  useEffect(() => {
    // 1. Initial theme state from document / storage (default: light)
    const isDark = document.documentElement.classList.contains('dark') || localStorage.getItem('civicbridge-theme') === 'dark'
    setThemePreference(isDark ? 'dark' : 'light')

    // 2. Listen for theme change events from ThemeToggle
    const handleThemeEvent = (e: Event) => {
      const custom = e as CustomEvent<string>
      setThemePreference(custom.detail === 'dark' ? 'dark' : 'light')
    }
    window.addEventListener('civicbridge-theme-change', handleThemeEvent)

    // 3. Fetch user profile
    fetch('/api/user/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setName(data.name || '')
          setEmail(data.email || '')
          setRole(data.role || '')
          setAccountStatus(data.accountStatus || 'APPROVED')
          if (data.themePreference) {
            setThemePreference(data.themePreference === 'dark' ? 'dark' : 'light')
          }
          if (data.citizen) setCitizen(data.citizen)
          if (data.government) setGovernment(data.government)
          if (data.university) setUniversity(data.university)
          if (data.faculty) setFaculty(data.faculty)
          if (data.industry) setIndustry(data.industry)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))

    return () => window.removeEventListener('civicbridge-theme-change', handleThemeEvent)
  }, [])

  const handleInstantThemeSelect = async (newTheme: 'light' | 'dark') => {
    setThemePreference(newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('civicbridge-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('civicbridge-theme', 'light')
    }
    window.dispatchEvent(new CustomEvent('civicbridge-theme-change', { detail: newTheme }))

    try {
      await fetch('/api/user/theme', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themePreference: newTheme }),
      })
    } catch (err) {
      console.error('Failed to sync theme preference:', err)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirmation do not match.' })
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          themePreference,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
          citizen: role === 'CITIZEN' ? citizen : undefined,
          government: role === 'GOVERNMENT' ? government : undefined,
          university: role === 'UNIVERSITY' ? university : undefined,
          faculty: role === 'FACULTY' ? faculty : undefined,
          industry: role === 'INDUSTRY' ? industry : undefined,
        }),
      })

      const result = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile and preferences successfully saved to database.' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')

        if (update) update()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred while saving.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardShell>
      <div className="page-content space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account & Profile Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal identity, role details, theme preferences, and security credentials.
          </p>
        </div>

        {/* Feedback Message */}
        {message && (
          <div
            className={`p-4 rounded-xl text-sm flex items-center gap-2.5 animate-fade-in ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Settings Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal Profile</span>
          </button>

          {role !== 'ADMIN' && (
            <button
              onClick={() => setActiveTab('role')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'role'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Role Profile Details</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'theme'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Theme & Display</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'security'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* Content Form */}
        {loading ? (
          <div className="card p-8 animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded w-full" />
            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded w-full" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* TAB 1: Personal Profile */}
            {activeTab === 'profile' && (
              <div className="card p-6 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Basic Identification</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Your public identity and contact coordinates on SIH 26043.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                      Role: {role}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      accountStatus === 'APPROVED'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                    }`}>
                      Status: {accountStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                      placeholder="e.g. Ramesh Kumar"
                    />
                  </div>

                  <div>
                    <label className="label">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      placeholder="e.g. user@example.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Role-Specific Profile Details */}
            {activeTab === 'role' && (
              <div className="card p-6 space-y-5">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {role} Profile Attributes
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Specific institutional, geographic, and domain attributes required for your role.
                  </p>
                </div>

                {role === 'CITIZEN' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Phone Number</label>
                      <input
                        type="tel"
                        value={citizen.phone || ''}
                        onChange={(e) => setCitizen({ ...citizen, phone: e.target.value })}
                        className="input"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="label">City / Town</label>
                      <input
                        type="text"
                        value={citizen.city || ''}
                        onChange={(e) => setCitizen({ ...citizen, city: e.target.value })}
                        className="input"
                        placeholder="e.g. Varanasi"
                      />
                    </div>
                    <div>
                      <label className="label">State</label>
                      <input
                        type="text"
                        value={citizen.state || ''}
                        onChange={(e) => setCitizen({ ...citizen, state: e.target.value })}
                        className="input"
                        placeholder="e.g. Uttar Pradesh"
                      />
                    </div>
                    <div>
                      <label className="label">Residential Address</label>
                      <input
                        type="text"
                        value={citizen.address || ''}
                        onChange={(e) => setCitizen({ ...citizen, address: e.target.value })}
                        className="input"
                        placeholder="e.g. Sector 4, Ward 12"
                      />
                    </div>
                  </div>
                )}

                {role === 'GOVERNMENT' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Governing Authority</label>
                      <input
                        type="text"
                        value={government.authority || ''}
                        onChange={(e) => setGovernment({ ...government, authority: e.target.value })}
                        className="input"
                        placeholder="e.g. Varanasi Municipal Corporation"
                      />
                    </div>
                    <div>
                      <label className="label">Official Department</label>
                      <input
                        type="text"
                        value={government.department || ''}
                        onChange={(e) => setGovernment({ ...government, department: e.target.value })}
                        className="input"
                        placeholder="e.g. Public Works Department (PWD)"
                      />
                    </div>
                    <div>
                      <label className="label">Official Designation</label>
                      <input
                        type="text"
                        value={government.designation || ''}
                        onChange={(e) => setGovernment({ ...government, designation: e.target.value })}
                        className="input"
                        placeholder="e.g. Executive Engineer"
                      />
                    </div>
                    <div>
                      <label className="label">Jurisdiction Ward / District</label>
                      <input
                        type="text"
                        value={government.jurisdiction || ''}
                        onChange={(e) => setGovernment({ ...government, jurisdiction: e.target.value })}
                        className="input"
                        placeholder="e.g. Zone 3 / Eastern District"
                      />
                    </div>
                  </div>
                )}

                {role === 'UNIVERSITY' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">University Name</label>
                      <input
                        type="text"
                        value={university.university || ''}
                        onChange={(e) => setUniversity({ ...university, university: e.target.value })}
                        className="input"
                        placeholder="e.g. IIT BHU / State University"
                      />
                    </div>
                    <div>
                      <label className="label">Academic Department</label>
                      <input
                        type="text"
                        value={university.department || ''}
                        onChange={(e) => setUniversity({ ...university, department: e.target.value })}
                        className="input"
                        placeholder="e.g. Civil & Environmental Engineering"
                      />
                    </div>
                    <div>
                      <label className="label">Designation</label>
                      <input
                        type="text"
                        value={university.designation || ''}
                        onChange={(e) => setUniversity({ ...university, designation: e.target.value })}
                        className="input"
                        placeholder="e.g. Dean of Research / Department Head"
                      />
                    </div>
                  </div>
                )}

                {role === 'FACULTY' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">University / Institution</label>
                      <input
                        type="text"
                        value={faculty.university || ''}
                        onChange={(e) => setFaculty({ ...faculty, university: e.target.value })}
                        className="input"
                        placeholder="e.g. IIT BHU"
                      />
                    </div>
                    <div>
                      <label className="label">Department</label>
                      <input
                        type="text"
                        value={faculty.department || ''}
                        onChange={(e) => setFaculty({ ...faculty, department: e.target.value })}
                        className="input"
                        placeholder="e.g. Water Resources Engineering"
                      />
                    </div>
                    <div>
                      <label className="label">Research Expertise</label>
                      <input
                        type="text"
                        value={faculty.expertise || ''}
                        onChange={(e) => setFaculty({ ...faculty, expertise: e.target.value })}
                        className="input"
                        placeholder="e.g. Urban Drainage, Hydrological Modeling"
                      />
                    </div>
                    <div>
                      <label className="label">Faculty Designation</label>
                      <input
                        type="text"
                        value={faculty.designation || ''}
                        onChange={(e) => setFaculty({ ...faculty, designation: e.target.value })}
                        className="input"
                        placeholder="e.g. Associate Professor"
                      />
                    </div>
                  </div>
                )}

                {role === 'INDUSTRY' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Enterprise / Company Name</label>
                      <input
                        type="text"
                        value={industry.company || ''}
                        onChange={(e) => setIndustry({ ...industry, company: e.target.value })}
                        className="input"
                        placeholder="e.g. Tata Sustainability Ventures"
                      />
                    </div>
                    <div>
                      <label className="label">Sector / Domain</label>
                      <input
                        type="text"
                        value={industry.sector || ''}
                        onChange={(e) => setIndustry({ ...industry, sector: e.target.value })}
                        className="input"
                        placeholder="e.g. Urban Infrastructure, Smart Water Tech"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Corporate Website</label>
                      <input
                        type="url"
                        value={industry.website || ''}
                        onChange={(e) => setIndustry({ ...industry, website: e.target.value })}
                        className="input"
                        placeholder="https://company.example.com"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Theme & Display Preferences */}
            {activeTab === 'theme' && (
              <div className="card p-6 space-y-5">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Theme & Display Preference</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your choice is stored directly in the database and applied seamlessly across all devices.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'light', title: 'Light Theme (Default)', desc: 'Clean, bright surfaces with rich contrast and daylight readability' },
                    { id: 'dark', title: 'Dark Theme', desc: 'Deep slate backgrounds with high-contrast text and low eye strain' },
                  ].map((t) => {
                    const isSelected = themePreference === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleInstantThemeSelect(t.id as 'light' | 'dark')}
                        className={`p-5 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{t.title}</span>
                          {isSelected && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white dark:bg-indigo-500">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: Security & Password */}
            {activeTab === 'security' && (
              <div className="card p-6 space-y-5">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Change Password</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter your current password followed by your desired new password.
                  </p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="label">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input"
                      placeholder="Enter current password (demo: demo1234)"
                    />
                  </div>

                  <div>
                    <label className="label">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input"
                      placeholder="Minimum 6 characters"
                    />
                  </div>

                  <div>
                    <label className="label">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input"
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary px-6 py-2.5 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving changes...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardShell>
  )
}
