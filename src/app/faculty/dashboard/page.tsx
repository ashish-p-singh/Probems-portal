'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import { ChevronRight, Briefcase, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react'

export default function FacultyDashboard() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => { setProjects(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const activeProjects = projects.filter((p) => !['COMPLETED', 'IMPACT_MEASURED'].includes(p.status))
  const needReview = projects.filter((p) => ['CHANGES_REQUESTED'].includes(p.status))

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Leader Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome, {session?.user?.name}. Manage your assigned projects.</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="card p-4 border-l-4 border-l-indigo-400">
            <p className="text-3xl font-bold text-slate-900">{activeProjects.length}</p>
            <p className="text-sm text-slate-500">Active Projects</p>
          </div>
          <div className="card p-4 border-l-4 border-l-amber-400">
            <p className="text-3xl font-bold text-slate-900">{needReview.length}</p>
            <p className="text-sm text-slate-500">Need Review</p>
          </div>
          <div className="card p-4 border-l-4 border-l-emerald-400">
            <p className="text-3xl font-bold text-slate-900">
              {projects.reduce((acc: number, p: any) => acc + (p.milestones?.filter((m: any) => m.completedAt)?.length || 0), 0)}
            </p>
            <p className="text-sm text-slate-500">Milestones Completed</p>
          </div>
          <div className="card p-4 border-l-4 border-l-blue-400">
            <p className="text-3xl font-bold text-slate-900">{projects.length}</p>
            <p className="text-sm text-slate-500">Total Projects</p>
          </div>
        </div>

        {needReview.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-3">⚡ Government Feedback — Action Required</h2>
            <div className="space-y-2">
              {needReview.map((p) => (
                <Link key={p.id} href={`/faculty/projects/${p.id}`} className="card p-4 flex items-center gap-4 border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all block">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.problem?.title}</p>
                    <p className="text-xs text-amber-600 mt-0.5">Government has requested changes to the solution</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-base font-semibold text-slate-900 mb-3">Assigned Projects</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="card p-5 animate-pulse h-20 bg-slate-50" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="card p-8 text-center text-slate-400 text-sm">No projects assigned yet.</div>
          ) : (
            <div className="space-y-3">
              {projects.map((proj) => {
                const done = proj.milestones?.filter((m: any) => m.completedAt).length || 0
                const total = proj.milestones?.length || 0
                return (
                  <Link key={proj.id} href={`/faculty/projects/${proj.id}`} className="card p-5 flex items-start gap-4 hover:border-indigo-200 hover:shadow-sm transition-all duration-150 block">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-slate-400">{proj.problem?.referenceId}</span>
                        <StatusBadge status={proj.status} />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-1 truncate">{proj.problem?.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{proj.team?.name || 'No team'}</span>
                        {total > 0 && <span>{done}/{total} milestones</span>}
                      </div>
                      {total > 0 && (
                        <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(done/total)*100}%` }} />
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
