'use client'

import { useEffect, useState } from 'react'
import { DashboardShell } from '@/components/layout/Sidebar'
import {
  Building2, Plus, Users, MapPin, Search, CheckCircle2,
  AlertCircle, ShieldCheck, X
} from 'lucide-react'
import { format } from 'date-fns'

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // New Org Form
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState('MUNICIPALITY')
  const [department, setDepartment] = useState('')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')

  const fetchOrgs = () => {
    setLoading(true)
    fetch('/api/admin/organizations')
      .then((r) => r.json())
      .then((d) => {
        setOrganizations(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrgs()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, type, department, state, district }),
      })
      const data = await res.json()
      if (res.ok) {
        setOrganizations((prev) => [data.organization, ...prev])
        setShowAddModal(false)
        setName('')
        setCode('')
        setDepartment('')
        setState('')
        setDistrict('')
        setMessage(`Organization "${data.organization.name}" was successfully registered.`)
        setTimeout(() => setMessage(null), 3500)
      } else {
        alert(data.error || 'Failed to create organization')
      }
    } catch {
      alert('Network error')
    } finally {
      setCreating(false)
    }
  }

  const filtered = organizations.filter((org) => {
    const matchSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      (org.code && org.code.toLowerCase().includes(search.toLowerCase())) ||
      (org.department && org.department.toLowerCase().includes(search.toLowerCase()))
    if (!matchSearch) return false
    if (typeFilter !== 'ALL' && org.type !== typeFilter) return false
    return true
  })

  const orgTypes = [
    { key: 'ALL', label: 'All Bodies' },
    { key: 'MUNICIPALITY', label: 'Municipalities' },
    { key: 'PANCHAYAT', label: 'Panchayats' },
    { key: 'UNIVERSITY', label: 'Universities' },
    { key: 'INDUSTRY_PARTNER', label: 'Industry Partners' },
  ]

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Registered Organizations & Bodies</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Master catalog of municipal corporations, panchayats, universities, and industrial partners.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Organization</span>
          </button>
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-sm flex items-center justify-between animate-fade-in shadow-sm">
            <span className="font-medium">{message}</span>
            <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search organizations or departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {orgTypes.map((t) => (
              <button
                key={t.key}
                onClick={() => setTypeFilter(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  typeFilter === t.key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Organizations Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-5 animate-pulse space-y-3">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">No organizations found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Try changing your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((org) => (
              <div
                key={org.id}
                className="card p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                      {org.type.replace(/_/g, ' ')}
                    </span>
                    {org.code && (
                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                        {org.code}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{org.name}</h3>

                  {org.department && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                      {org.department}
                    </p>
                  )}

                  {(org.district || org.state) && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{[org.district, org.state].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{org._count?.members || 0} Members</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {org.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Org Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="card max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Building2 className="w-5 h-5" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Register Organization</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="label">Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    placeholder="e.g. Varanasi Municipal Corporation"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Organization Type *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="select"
                    >
                      <option value="MUNICIPALITY">Municipality</option>
                      <option value="PANCHAYAT">Panchayat</option>
                      <option value="UNIVERSITY">University</option>
                      <option value="INDUSTRY_PARTNER">Industry Partner</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Identifier Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="input"
                      placeholder="e.g. VMC-UP"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Department / Branch</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="input"
                    placeholder="e.g. Public Works Department"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="input"
                      placeholder="e.g. Varanasi"
                    />
                  </div>
                  <div>
                    <label className="label">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="input"
                      placeholder="e.g. Uttar Pradesh"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={creating}
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary text-xs px-3 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    {creating ? 'Registering...' : 'Register Body'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
