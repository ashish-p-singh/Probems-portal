'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import { MapPin, Users, ChevronRight, CheckSquare, Clock, Briefcase, GraduationCap, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export default function UniversityDashboard() {
  const { data: session } = useSession()
  const [problems, setProblems] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [scope, setScope] = useState<'discipline' | 'all'>('discipline')

  const universityName = session?.user?.university
  const discipline = session?.user?.discipline || session?.user?.department

  useEffect(() => {
    setLoading(true)
    const problemsUrl = scope === 'all' ? '/api/problems?scope=all' : '/api/problems'
    Promise.all([
      fetch(problemsUrl).then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
    ]).then(([p, pr]) => {
      setProblems(Array.isArray(p) ? p : [])
      setProjects(Array.isArray(pr) ? pr : [])
      setLoading(false)
    })
  }, [scope])

  const availableProblems = problems.filter((p) =>
    ['VERIFIED', 'UNDER_UNIVERSITY_REVIEW'].includes(p.status)
  )

  const acceptProblem = async (problemId: string, title: string) => {
    setAccepting(problemId)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, action: 'ACCEPT', title: `Project: ${title}` }),
      })
      if (res.ok) {
        const proj = await res.json()
        setProjects((prev) => [proj, ...prev])
        setProblems((prev) => prev.map((p) => p.id === problemId ? { ...p, status: 'ACCEPTED' } : p))
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Failed to accept problem')
      }
    } finally {
      setAccepting(null)
    }
  }

  const activeProjects = projects.filter((p) =>
    !['COMPLETED', 'IMPACT_MEASURED'].includes(p.status)
  )

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {(universityName || discipline) && (
              <div className="flex items-center gap-2 flex-wrap text-xs mb-1">
                {universityName && (
                  <span className="inline-flex items-center gap-1 font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                    <GraduationCap className="w-3 h-3" />
                    {universityName}
                  </span>
                )}
                {discipline && (
                  <span className="text-slate-500 font-medium">{discipline}</span>
                )}
              </div>
            )}
            <h1 className="text-2xl font-bold text-slate-900">University Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              {discipline ? `Showing verified problems matching ${discipline}.` : 'Review government-verified problems and manage university projects.'}
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setScope('discipline')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                scope === 'discipline' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Discipline ({problems.length})
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                scope === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Verified
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 border-l-4 border-l-amber-400">
            <p className="text-3xl font-bold text-slate-900">{availableProblems.length}</p>
            <p className="text-sm text-slate-500">Problems for Review</p>
          </div>
          <div className="card p-4 border-l-4 border-l-indigo-400">
            <p className="text-3xl font-bold text-slate-900">{activeProjects.length}</p>
            <p className="text-sm text-slate-500">Active Projects</p>
          </div>
          <div className="card p-4 border-l-4 border-l-emerald-400">
            <p className="text-3xl font-bold text-slate-900">{projects.length}</p>
            <p className="text-sm text-slate-500">Total Projects</p>
          </div>
        </div>

        {/* Problems for review */}
        {availableProblems.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-3">⚡ Verified Problems — Pending University Decision</h2>
            <div className="space-y-3">
              {availableProblems.map((p) => (
                <div key={p.id} className="card p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-slate-400">{p.referenceId}</span>
                        <StatusBadge status={p.status} />
                        {p.aiSeverity && (
                          <span className={`badge text-xs ${p.aiSeverity === 'HIGH' || p.aiSeverity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {p.aiSeverity} Severity
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-1">{p.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</span>
                        {p.affectedPopulation && <span className="flex items-center gap-1"><Users className="w-3 h-3" />~{p.affectedPopulation.toLocaleString()} affected</span>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptProblem(p.id, p.title)}
                          disabled={accepting === p.id}
                          className="btn-success text-xs py-1.5"
                        >
                          {accepting === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                          Accept Problem
                        </button>
                        <Link href={`/problems/${p.id}`} className="btn-secondary text-xs py-1.5">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active projects */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Active Projects</h2>
            <Link href="/university/projects" className="text-sm text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              [1,2].map(i => <div key={i} className="card p-5 animate-pulse h-20 bg-slate-50" />)
            ) : activeProjects.length === 0 ? (
              <div className="card p-8 text-center text-slate-400 text-sm">No active projects</div>
            ) : (
              activeProjects.map((proj) => (
                <Link key={proj.id} href={`/university/projects/${proj.id}`} className="card p-5 flex items-start gap-4 hover:border-indigo-200 hover:shadow-sm transition-all duration-150 block">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-slate-400">{proj.problem?.referenceId}</span>
                      <StatusBadge status={proj.status} />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1 truncate">{proj.problem?.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {proj.team && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{proj.team.name}</span>}
                      {proj.facultyAssignment?.faculty && <span>Faculty: {proj.facultyAssignment.faculty.name}</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
