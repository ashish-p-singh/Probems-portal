'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import {
  FileText, Search, MapPin, Users, CheckSquare,
  AlertCircle, ChevronRight, Loader2, Sparkles, Flame
} from 'lucide-react'
import { format } from 'date-fns'

export default function UniversityProblemsPage() {
  const router = useRouter()
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/problems')
      .then((r) => r.json())
      .then((d) => {
        setProblems(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const acceptProblem = async (problemId: string, title: string) => {
    setAcceptingId(problemId)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, action: 'ACCEPT', title: `Project: ${title}` }),
      })
      if (res.ok) {
        const proj = await res.json()
        router.push(`/university/projects/${proj.id}`)
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Failed to accept problem')
      }
    } finally {
      setAcceptingId(null)
    }
  }

  // Filter problems available for university or already accepted
  const verifiedProblems = problems.filter((p) =>
    ['VERIFIED', 'UNDER_UNIVERSITY_REVIEW', 'ACCEPTED', 'TEAM_FORMATION', 'SOLUTION_DEVELOPMENT'].includes(p.status)
  )

  const filtered = verifiedProblems.filter((p) => {
    const matches =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.referenceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    return matches
  })

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/university/dashboard" className="hover:text-slate-900">University</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Verified Problems</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Verified Civic Problems for University Adoption</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            These problems have been field-verified by government authorities and routed to universities for technical research and engineering solutions.
          </p>
        </div>

        {/* Filter bar */}
        <div className="card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, category, location, or ref ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium self-end sm:self-center">
            Showing {filtered.length} verified problems
          </span>
        </div>

        {/* Problems List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No verified problems found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Problems will appear here after field verification is approved by the municipal government.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((p) => {
              const isAccepted = ['ACCEPTED', 'TEAM_FORMATION', 'SOLUTION_DEVELOPMENT'].includes(p.status)

              return (
                <div key={p.id} className="card p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {p.isEmergency && (
                          <span className="font-bold text-[11px] bg-rose-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                            <Flame className="w-3 h-3" />
                            CRITICAL EMERGENCY
                          </span>
                        )}
                        <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {p.referenceId}
                        </span>
                        <StatusBadge status={p.status} />
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {p.category.replace(/_/g, ' ')}
                        </span>
                        {p.aiSeverity && (
                          <span className={`badge text-xs ${
                            p.aiSeverity === 'HIGH' || p.aiSeverity === 'CRITICAL'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {p.aiSeverity} Priority
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-semibold text-slate-900">
                        {p.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {p.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{p.location}</span>
                        </span>
                        {p.affectedPopulation && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>~{p.affectedPopulation.toLocaleString()} citizens affected</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col items-end gap-2 flex-shrink-0">
                      {isAccepted ? (
                        <Link
                          href={p.project?.id ? `/university/projects/${p.project.id}` : '/university/projects'}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Open Project Workspace <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => acceptProblem(p.id, p.title)}
                          disabled={acceptingId === p.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                        >
                          {acceptingId === p.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Adopting...</span>
                            </>
                          ) : (
                            <>
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span>Accept & Create Project</span>
                            </>
                          )}
                        </button>
                      )}

                      <Link
                        href={`/problems/${p.id}`}
                        className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
                      >
                        View Verification Details
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
