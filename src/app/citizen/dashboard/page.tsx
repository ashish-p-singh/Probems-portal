'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import {
  Plus, MapPin, Users, Clock, ChevronRight, FileText, User,
  Sparkles, AlertTriangle, CheckCircle2, Info, ArrowRight, Globe2
} from 'lucide-react'
import { format } from 'date-fns'

type Insight = {
  greeting: string
  summary?: string
  statusBreakdown?: string
  insight: string
  priority?: string
  type: 'info' | 'success' | 'warning' | 'urgent'
}

const insightColors = {
  info: { bg: 'bg-indigo-50/70', border: 'border-indigo-100', text: 'text-indigo-950', badge: 'bg-indigo-100 text-indigo-700', icon: Info, iconColor: 'text-indigo-600' },
  success: { bg: 'bg-emerald-50/70', border: 'border-emerald-100', text: 'text-emerald-950', badge: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, iconColor: 'text-emerald-600' },
  warning: { bg: 'bg-amber-50/70', border: 'border-amber-100', text: 'text-amber-950', badge: 'bg-amber-100 text-amber-700', icon: AlertTriangle, iconColor: 'text-amber-600' },
  urgent: { bg: 'bg-rose-50/70', border: 'border-rose-100', text: 'text-rose-950', badge: 'bg-rose-100 text-rose-700', icon: AlertTriangle, iconColor: 'text-rose-600' },
}

export default function CitizenDashboard() {
  const { data: session } = useSession()
  const [problems, setProblems] = useState<any[]>([])
  const [communityProblems, setCommunityProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [communityLoading, setCommunityLoading] = useState(false)
  const [tab, setTab] = useState<'my' | 'community'>('my')
  const [insight, setInsight] = useState<Insight | null>(null)
  const [insightLoading, setInsightLoading] = useState(false)

  // Fetch MY problems only
  useEffect(() => {
    fetch('/api/problems')
      .then((r) => r.json())
      .then((d) => {
        const myProblems = Array.isArray(d) ? d : []
        setProblems(myProblems)
        setLoading(false)
        // Only fetch AI insight if there are problems
        if (myProblems.length > 0 && session?.user) {
          fetchInsight(myProblems)
        }
      })
      .catch(() => setLoading(false))
  }, [session])

  const fetchInsight = async (myProblems: any[]) => {
    setInsightLoading(true)
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'CITIZEN',
          name: session?.user?.name,
          problems: myProblems.map((p) => ({
            id: p.id,
            status: p.status,
            category: p.category,
            title: p.title,
            isEmergency: p.isEmergency,
            referenceId: p.referenceId,
            confirmationCount: p.confirmationCount || 0,
          })),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setInsight(data)
      }
    } catch { /* non-fatal */ }
    setInsightLoading(false)
  }

  // Fetch community problems (lazy — only when tab is switched)
  const handleCommunityTab = () => {
    setTab('community')
    if (communityProblems.length === 0) {
      setCommunityLoading(true)
      fetch('/api/problems?scope=community')
        .then((r) => r.json())
        .then((d) => { setCommunityProblems(Array.isArray(d) ? d : []); setCommunityLoading(false) })
        .catch(() => setCommunityLoading(false))
    }
  }

  const active = problems.filter((p) =>
    !['SUSTAINABLE_IMPACT', 'PROBLEM_SOLVED', 'REJECTED_BY_GOVT', 'REJECTED_BY_UNIVERSITY'].includes(p.status)
  )
  const resolved = problems.filter((p) =>
    ['SUSTAINABLE_IMPACT', 'PROBLEM_SOLVED'].includes(p.status)
  )

  return (
    <DashboardShell>
      <div className="page-content space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Welcome back, <span className="font-medium text-slate-700">{session?.user?.name}</span>.
              {problems.length > 0
                ? ` You have ${problems.length} problem${problems.length > 1 ? 's' : ''} submitted.`
                : ' Start by reporting your first problem.'}
            </p>
          </div>
          <Link href="/citizen/problems/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            Report Problem
          </Link>
        </div>

        {/* ── Tab Switcher ── */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-sm font-medium w-fit">
          <button
            onClick={() => setTab('my')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              tab === 'my'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Submitted Problems ({problems.length})</span>
          </button>
          <button
            onClick={handleCommunityTab}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              tab === 'community'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>Community Feed</span>
          </button>
        </div>

        {/* -- MY PROBLEMS TAB -- */}
        {tab === 'my' && (
          <div className="space-y-6">
            {/* Stats — only when there are problems */}
            {problems.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <div className="card p-4">
                  <p className="text-2xl font-bold text-slate-900">{problems.length}</p>
                  <p className="text-sm text-slate-500">Total Submitted</p>
                </div>
                <div className="card p-4">
                  <p className="text-2xl font-bold text-indigo-700">{active.length}</p>
                  <p className="text-sm text-slate-500">In Progress</p>
                </div>
                <div className="card p-4">
                  <p className="text-2xl font-bold text-emerald-600">{resolved.length}</p>
                  <p className="text-sm text-slate-500">Resolved</p>
                </div>
              </div>
            )}

            {/* AI Dashboard & Problem Status Summary — only when there are problems */}
            {problems.length > 0 && (
              insightLoading ? (
                <div className="card p-5 border border-indigo-100 bg-indigo-50/40 space-y-3 animate-pulse">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <div className="h-4 bg-indigo-200/50 rounded w-48" />
                  </div>
                  <div className="h-3 bg-slate-200/60 rounded w-5/6" />
                  <div className="h-3 bg-slate-200/60 rounded w-2/3" />
                </div>
              ) : insight ? (
                (() => {
                  const style = insightColors[insight.type]
                  const Icon = style.icon
                  return (
                    <div className={`card p-5 border ${style.border} ${style.bg} space-y-3.5`}>
                      {/* Top Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Dashboard & Status Summary
                          </span>
                        </div>
                        {insight.priority && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-200/60">
                            <ArrowRight className="w-3 h-3 text-indigo-600" />
                            <span className="font-semibold text-slate-700">Next Priority:</span> {insight.priority}
                          </span>
                        )}
                      </div>

                      {/* Greeting & Summary */}
                      <div className="space-y-1">
                        <h2 className={`text-sm font-bold ${style.text} flex items-center gap-1.5`}>
                          <Icon className={`w-4 h-4 ${style.iconColor}`} />
                          {insight.greeting}
                        </h2>
                        {insight.summary && (
                          <p className="text-xs text-slate-700 leading-relaxed font-normal">
                            {insight.summary}
                          </p>
                        )}
                      </div>

                      {/* Status Breakdown & Guidance */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-200/60 text-xs">
                        {insight.statusBreakdown && (
                          <div className="bg-white/70 p-3 rounded-lg border border-slate-100">
                            <span className="font-semibold text-slate-700 block mb-0.5">📊 Status of Your Problems</span>
                            <p className="text-slate-600 leading-relaxed">{insight.statusBreakdown}</p>
                          </div>
                        )}
                        {insight.insight && (
                          <div className="bg-white/70 p-3 rounded-lg border border-slate-100">
                            <span className="font-semibold text-slate-700 block mb-0.5">💡 Action & Next Steps</span>
                            <p className="text-slate-600 leading-relaxed">{insight.insight}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()
              ) : null
            )}

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
              /* Empty state — clean, no fake AI insights */
              <div className="card p-14 text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-indigo-300" />
                </div>
                <h3 className="text-slate-700 font-semibold mb-1">No problems yet</h3>
                <p className="text-slate-400 text-sm mb-5 max-w-xs mx-auto">
                  Your personal problem tracker will show up here. Report a civic issue and track its progress from submission to resolution.
                </p>
                <Link href="/citizen/problems/new" className="btn-primary">
                  <Plus className="w-4 h-4" />
                  Report your first problem
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-700">Your Submitted Problems</h2>
                {problems.map((p) => (
                  <Link
                    key={p.id}
                    href={`/problems/${p.id}`}
                    className="card p-5 flex items-start gap-4 hover:border-indigo-200 hover:shadow-sm transition-all duration-150 block"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-slate-400">{p.referenceId}</span>
                        <StatusBadge status={p.status} />
                        {p.isEmergency && (
                          <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">🚨 Emergency</span>
                        )}
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
        )}

        {/* -- COMMUNITY TAB -- */}
        {tab === 'community' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Community Problems</h2>
              <p className="text-sm text-slate-500 mt-0.5">Browse all civic problems reported across the platform. Confirm problems you've also experienced.</p>
            </div>

            {communityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="card p-5 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : communityProblems.length === 0 ? (
              <div className="card p-12 text-center">
                <Globe2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No community problems yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {communityProblems.map((p) => (
                  <Link
                    key={p.id}
                    href={`/problems/${p.id}`}
                    className="card p-4 flex items-start gap-4 hover:border-indigo-200 hover:shadow-sm transition-all block"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-slate-400">{p.referenceId}</span>
                        <StatusBadge status={p.status} />
                        {p.isEmergency && (
                          <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">🚨 Emergency</span>
                        )}
                        {p.confirmationCount > 0 && (
                          <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {p.confirmationCount} citizens affected
                          </span>
                        )}
                        {p.hasConfirmed && (
                          <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">✓ You confirmed</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.title}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(p.createdAt), 'dd MMM yyyy')}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardShell>
  )
}
