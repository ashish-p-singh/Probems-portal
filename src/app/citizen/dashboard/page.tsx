'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import {
  Plus, MapPin, Users, Clock, ChevronRight, FileText,
  Sparkles, AlertTriangle, CheckCircle2, Info, ArrowRight, Globe2
} from 'lucide-react'
import { format } from 'date-fns'

type Insight = {
  greeting: string
  insight: string
  priority?: string
  type: 'info' | 'success' | 'warning' | 'urgent'
}

const insightColors = {
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: Info, iconColor: 'text-blue-500' },
  success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: CheckCircle2, iconColor: 'text-emerald-500' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: AlertTriangle, iconColor: 'text-amber-500' },
  urgent: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: AlertTriangle, iconColor: 'text-red-500' },
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
          problems: myProblems.map((p) => ({ status: p.status, category: p.category, title: p.title })),
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
            <FileText className="w-4 h-4" />
            My Problems
            {problems.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === 'my' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                {problems.length}
              </span>
            )}
          </button>
          <button
            onClick={handleCommunityTab}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              tab === 'community'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            Community Problems
          </button>
        </div>

        {/* ══════════════════ MY PROBLEMS TAB ══════════════════ */}
        {tab === 'my' && (
          <>
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

            {/* AI Insight — only when there are problems */}
            {problems.length > 0 && (
              insightLoading ? (
                <div className="card p-4 flex items-center gap-3 animate-pulse">
                  <Sparkles className="w-5 h-5 text-indigo-300" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                </div>
              ) : insight ? (
                (() => {
                  const style = insightColors[insight.type]
                  const Icon = style.icon
                  return (
                    <div className={`card p-4 border ${style.border} ${style.bg}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                          <Icon className={`w-4 h-4 ${style.iconColor}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${style.text} mb-0.5`}>{insight.greeting}</p>
                          <p className={`text-xs ${style.text} opacity-80 leading-relaxed`}>{insight.insight}</p>
                          {insight.priority && (
                            <p className={`text-xs font-medium ${style.text} mt-1.5 flex items-center gap-1`}>
                              <ArrowRight className="w-3 h-3" />
                              {insight.priority}
                            </p>
                          )}
                        </div>
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
          </>
        )}

        {/* ══════════════════ COMMUNITY TAB ══════════════════ */}
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
