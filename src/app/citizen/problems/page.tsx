'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import { CommunityConfirmButton } from '@/components/workflow/CommunityConfirmButton'
import {
  FileText, Plus, Search, MapPin, Users,
  ChevronRight, Clock, AlertCircle, Globe, User, CheckCircle, Trash2, X, Flame
} from 'lucide-react'
import { format } from 'date-fns'

export default function CitizenProblemsPage() {
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewScope, setViewScope] = useState<'community' | 'my'>('community')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Deletion modal state
  const [problemToDelete, setProblemToDelete] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)

  const fetchProblems = (scope: 'community' | 'my') => {
    setLoading(true)
    fetch(`/api/problems?scope=${scope}`)
      .then((r) => r.json())
      .then((d) => {
        setProblems(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchProblems(viewScope)
  }, [viewScope])

  const handleDelete = async () => {
    if (!problemToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/problems/${problemToDelete.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (res.ok) {
        setProblems((prev) => prev.filter((p) => p.id !== problemToDelete.id))
        setDeleteMessage(`Problem "${problemToDelete.title}" was successfully deleted.`)
        setTimeout(() => setDeleteMessage(null), 4000)
        setProblemToDelete(null)
      } else {
        alert(data.error || 'Failed to delete problem')
      }
    } catch (err) {
      alert('Network error while deleting problem')
    } finally {
      setDeleting(false)
    }
  }

  const categories = [
    'ALL',
    'DRAINAGE_FLOODING',
    'WATER_SUPPLY',
    'ROAD_TRANSPORT',
    'SANITATION',
    'ELECTRICITY',
    'ENVIRONMENT',
    'INFRASTRUCTURE',
  ]

  const filtered = problems.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.referenceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false

    if (statusFilter === 'ALL') return true
    if (statusFilter === 'EMERGENCY') return Boolean(p.isEmergency)
    if (statusFilter === 'ACTIVE') {
      return !['SUSTAINABLE_IMPACT', 'PROBLEM_SOLVED', 'REJECTED_BY_GOVT', 'REJECTED_BY_UNIVERSITY'].includes(
        p.status
      )
    }
    if (statusFilter === 'SOLVED') {
      return ['SUSTAINABLE_IMPACT', 'PROBLEM_SOLVED'].includes(p.status)
    }
    return p.status === statusFilter
  })

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        {deleteMessage && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-sm flex items-center justify-between animate-fade-in shadow-sm">
            <span className="font-medium">{deleteMessage}</span>
            <button onClick={() => setDeleteMessage(null)} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <Link href="/citizen/dashboard" className="hover:text-slate-900 dark:hover:text-slate-200">
                Citizen
              </Link>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Problems Portal</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {viewScope === 'community' ? 'Community Civic Problems' : 'My Reported Civic Problems'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {viewScope === 'community'
                ? 'Explore problems raised by other citizens in your community. Confirm issues that affect you too (+1).'
                : 'Track the verification, university solution research, and impact progress of your reports.'}
            </p>
          </div>
          <Link
            href="/citizen/problems/new"
            className="btn-primary inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Report New Problem
          </Link>
        </div>

        {/* Scope Switcher Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md">
          <button
            onClick={() => setViewScope('community')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              viewScope === 'community'
                ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Community Feed</span>
          </button>
          <button
            onClick={() => setViewScope('my')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              viewScope === 'my'
                ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Reports</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="card p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, location, or reference ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { key: 'ALL', label: `All (${problems.length})` },
                { key: 'EMERGENCY', label: `🚨 Emergencies (${problems.filter(p => p.isEmergency).length})` },
                { key: 'ACTIVE', label: 'In Progress' },
                { key: 'SOLVED', label: 'Resolved' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    statusFilter === tab.key
                      ? tab.key === 'EMERGENCY'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 dark:border-slate-800 pt-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Problems list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-64" />
                </div>
                <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-20" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">No problems found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {viewScope === 'community'
                ? 'No community problems match your search criteria.'
                : 'You have not reported any civic problems matching this filter.'}
            </p>
            <Link href="/citizen/problems/new" className="btn-primary inline-flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Report a Civic Problem
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className={`card p-5 transition-all hover:shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  p.isEmergency
                    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20 dark:bg-rose-950/10 hover:border-rose-400'
                    : 'hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {p.isEmergency && (
                      <span className="font-bold text-[11px] bg-rose-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                        <Flame className="w-3 h-3" />
                        CRITICAL EMERGENCY
                      </span>
                    )}
                    <span className="font-mono text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">
                      {p.referenceId}
                    </span>
                    <StatusBadge status={p.status} />
                    {p.aiSeverity && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                          p.aiSeverity === 'CRITICAL'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                            : p.aiSeverity === 'HIGH'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                        }`}
                      >
                        Severity: {p.aiSeverity}
                      </span>
                    )}
                  </div>

                  <Link href={`/problems/${p.id}`} className="block group">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {p.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 mb-2.5">{p.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate max-w-[200px]">{p.location}</span>
                    </span>

                    {p.affectedPopulation && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>~{p.affectedPopulation.toLocaleString()} affected</span>
                      </span>
                    )}

                    {p.citizen?.name && (
                      <span>
                        Reported by <span className="font-medium text-slate-700 dark:text-slate-300">{p.citizen.name}</span>
                      </span>
                    )}

                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{format(new Date(p.createdAt), 'dd MMM yyyy')}</span>
                    </span>
                  </div>
                </div>

                {/* Actions: Community +1 Button, Case Room link, and Delete button (in My Reports) */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <CommunityConfirmButton
                    problemId={p.id}
                    initialCount={p.confirmationCount || 0}
                    initialConfirmed={p.hasConfirmed || false}
                  />

                  <Link
                    href={`/problems/${p.id}`}
                    className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    <span>Case Room</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  {viewScope === 'my' && (
                    <button
                      type="button"
                      onClick={() => setProblemToDelete(p)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
                      title="Delete this problem report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {problemToDelete && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="card max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Civic Problem?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{problemToDelete.referenceId}</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">&ldquo;{problemToDelete.title}&rdquo;</strong>?
                This action is permanent and will withdraw this problem, its attachments, and all associated workflow activity.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setProblemToDelete(null)}
                  className="btn-secondary text-xs px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="btn-danger text-xs px-4 py-2 flex items-center gap-1.5"
                >
                  {deleting ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

