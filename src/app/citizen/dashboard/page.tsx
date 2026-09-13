'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import { Plus, MapPin, Users, Clock, ChevronRight, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { AIInsightsCard } from '@/components/ai/AIInsightsCard'

export default function CitizenDashboard() {
  const { data: session } = useSession()
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/problems')
      .then((r) => r.json())
      .then((d) => { setProblems(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const active = problems.filter((p) => !['SUSTAINABLE_IMPACT', 'PROBLEM_SOLVED', 'REJECTED_BY_GOVT', 'REJECTED_BY_UNIVERSITY'].includes(p.status))
  const resolved = problems.filter((p) => ['SUSTAINABLE_IMPACT', 'PROBLEM_SOLVED'].includes(p.status))

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Problems</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Welcome back, {session?.user?.name}. Track your submitted problems.
            </p>
          </div>
          <Link href="/citizen/problems/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            Report Problem
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4">
            <p className="text-2xl font-bold text-slate-900">{problems.length}</p>
            <p className="text-sm text-slate-500">Total Submitted</p>
          </div>
          <div className="card p-4">
            <p className="text-2xl font-bold text-indigo-700">{active.length}</p>
            <p className="text-sm text-slate-500">Active</p>
          </div>
          <div className="card p-4">
            <p className="text-2xl font-bold text-emerald-600">{resolved.length}</p>
            <p className="text-sm text-slate-500">Resolved</p>
          </div>
        </div>

        {/* AI Insights */}
        <AIInsightsCard />

        {/* Problems list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">You haven't submitted any problems yet.</p>
            <Link href="/citizen/problems/new" className="btn-primary">
              Report your first problem
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {problems.map((p) => (
              <Link key={p.id} href={`/problems/${p.id}`} className="card p-5 flex items-start gap-4 hover:border-indigo-200 hover:shadow-sm transition-all duration-150 block">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-slate-400">{p.referenceId}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1 leading-snug">{p.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{p.location}
                    </span>
                    {p.affectedPopulation && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />~{p.affectedPopulation.toLocaleString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{format(new Date(p.createdAt), 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
