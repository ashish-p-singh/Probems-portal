'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import {
  MapPin, Users, ChevronRight, CheckSquare, Clock,
  TrendingUp, Shield, AlertCircle, Building2, Target, Filter
} from 'lucide-react'
import { format } from 'date-fns'
import { AIInsightsCard } from '@/components/ai/AIInsightsCard'

export default function GovernmentDashboard() {
  const { data: session } = useSession()
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deptFilter, setDeptFilter] = useState<'MY_DEPT' | 'ALL'>('MY_DEPT')

  const officerDept = session?.user?.department || 'Urban Development'

  useEffect(() => {
    fetch('/api/problems')
      .then((r) => r.json())
      .then((d) => {
        setProblems(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Check if problem matches officer's department
  const isDeptMatch = (p: any) => {
    const dept = (officerDept || '').toLowerCase()
    const pCategory = (p.category || '').toLowerCase()
    const pAiCategory = (p.aiCategory || '').toLowerCase()
    const pRecDept = (p.verification?.recommendedDept || p.aiRecommendedDepts || '').toLowerCase()
    const pMunicipality = (p.municipality || '').toLowerCase()

    if (dept.includes('water') || dept.includes('drainage')) {
      return pCategory.includes('water') || pCategory.includes('drainage') || pAiCategory.includes('water') || pAiCategory.includes('drainage')
    }
    if (dept.includes('road') || dept.includes('transport') || dept.includes('pwd')) {
      return pCategory.includes('road') || pCategory.includes('transport') || pCategory.includes('infrastructure')
    }
    if (dept.includes('sanitat') || dept.includes('waste')) {
      return pCategory.includes('sanitation') || pAiCategory.includes('sanitation')
    }
    if (dept.includes('urban') || dept.includes('development')) {
      return true // General urban development encompasses broad civic cases
    }
    return pRecDept.includes(dept) || pMunicipality.includes(dept)
  }

  // Sort: Department matching problems first, then by priority/recency
  const sortedProblems = [...problems].sort((a, b) => {
    const aMatch = isDeptMatch(a) ? 1 : 0
    const bMatch = isDeptMatch(b) ? 1 : 0
    if (bMatch !== aMatch) return bMatch - aMatch
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const displayedProblems = deptFilter === 'MY_DEPT' ? sortedProblems.filter(isDeptMatch) : sortedProblems

  const pendingVerification = problems.filter((p) =>
    ['SUBMITTED', 'UNDER_VERIFICATION', 'ADDITIONAL_INFO_REQUIRED'].includes(p.status)
  )
  const verified = problems.filter((p) => p.status === 'VERIFIED' || p.status === 'UNDER_UNIVERSITY_REVIEW')
  const pendingValidation = problems.filter((p) =>
    ['SOLUTION_SUBMITTED', 'GOVERNMENT_VALIDATION'].includes(p.status)
  )
  const implemented = problems.filter((p) =>
    ['IMPLEMENTATION', 'PROBLEM_SOLVED', 'SUSTAINABLE_IMPACT'].includes(p.status)
  )

  const myDeptCount = problems.filter(isDeptMatch).length

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="text-slate-700 font-medium">Government Administration</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                <Building2 className="w-3 h-3" />
                {officerDept}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Government Triage & Operations</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Verified problem triage, municipal concurrence, and solution validation for your jurisdiction.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setDeptFilter('MY_DEPT')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                deptFilter === 'MY_DEPT'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>My Department ({myDeptCount})</span>
            </button>
            <button
              onClick={() => setDeptFilter('ALL')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                deptFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Jurisdictions ({problems.length})
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4 border-l-4 border-l-amber-400">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900">{pendingVerification.length}</p>
                <p className="text-sm text-slate-500">Pending Verification</p>
              </div>
              <AlertCircle className="w-5 h-5 text-amber-400 mt-1" />
            </div>
          </div>
          <div className="card p-4 border-l-4 border-l-indigo-400">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900">{verified.length}</p>
                <p className="text-sm text-slate-500">Verified Problems</p>
              </div>
              <CheckSquare className="w-5 h-5 text-indigo-400 mt-1" />
            </div>
          </div>
          <div className="card p-4 border-l-4 border-l-blue-400">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900">{pendingValidation.length}</p>
                <p className="text-sm text-slate-500">Solution Validation</p>
              </div>
              <Shield className="w-5 h-5 text-blue-400 mt-1" />
            </div>
          </div>
          <div className="card p-4 border-l-4 border-l-emerald-400">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900">{implemented.length}</p>
                <p className="text-sm text-slate-500">Implemented</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-400 mt-1" />
            </div>
          </div>
        </div>

        {/* AI Executive Insights */}
        <AIInsightsCard />

        {/* Department Prioritized Triage List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>
                {deptFilter === 'MY_DEPT'
                  ? `Problems Assigned to ${officerDept}`
                  : 'All Civic Problems across Municipalities'}
              </span>
            </h2>
            <span className="text-xs text-slate-500">{displayedProblems.length} cases</span>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="card p-4 animate-pulse h-20 bg-slate-50 rounded-xl" />
              ))
            ) : displayedProblems.length === 0 ? (
              <div className="card p-8 text-center">
                <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-medium text-sm">
                  No issues currently flagged for {officerDept}
                </p>
                <button
                  onClick={() => setDeptFilter('ALL')}
                  className="mt-2 text-xs text-indigo-600 hover:underline"
                >
                  Switch to All Jurisdictions
                </button>
              </div>
            ) : (
              displayedProblems.map((p) => {
                const match = isDeptMatch(p)
                return (
                  <Link
                    key={p.id}
                    href={`/problems/${p.id}`}
                    className={`card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-150 hover:shadow-sm ${
                      match ? 'border-indigo-300 bg-indigo-50/20 hover:border-indigo-400' : 'hover:border-slate-300'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-medium text-slate-500">{p.referenceId}</span>
                        <StatusBadge status={p.status} />

                        {match && (
                          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            My Department Match
                          </span>
                        )}

                        {p.confirmationCount > 0 && (
                          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {p.confirmationCount} citizens affected
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-slate-900 truncate">{p.title}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{p.location}</span>
                        </span>
                        {p.municipality && <span>{p.municipality}</span>}
                        {p.affectedPopulation && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            ~{p.affectedPopulation.toLocaleString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {format(new Date(p.createdAt), 'dd MMM yyyy')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 flex-shrink-0 self-end sm:self-center">
                      <span>Open Case Room</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
