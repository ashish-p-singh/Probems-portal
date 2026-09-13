'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import { ChevronRight, Factory, TrendingUp, CheckCircle, Loader2 } from 'lucide-react'

export default function IndustryDashboard() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [collaborations, setCollaborations] = useState<any[]>([])

  useEffect(() => {
    // Load approved projects (available for collaboration)
    fetch('/api/problems')
      .then((r) => r.json())
      .then((d) => {
        const approved = (Array.isArray(d) ? d : []).filter((p: any) =>
          ['APPROVED', 'INDUSTRY_COLLABORATION', 'IMPLEMENTATION'].includes(p.status)
        )
        setProjects(approved)
        setLoading(false)
      })
  }, [])

  const opportunities = projects.filter((p: any) => p.status === 'APPROVED')
  const active = projects.filter((p: any) => ['INDUSTRY_COLLABORATION', 'IMPLEMENTATION'].includes(p.status))

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Industry Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Government-approved projects seeking industry collaboration.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 border-l-4 border-l-amber-400">
            <p className="text-3xl font-bold text-slate-900">{opportunities.length}</p>
            <p className="text-sm text-slate-500">Open Opportunities</p>
          </div>
          <div className="card p-4 border-l-4 border-l-indigo-400">
            <p className="text-3xl font-bold text-slate-900">{active.length}</p>
            <p className="text-sm text-slate-500">Active Collaborations</p>
          </div>
          <div className="card p-4 border-l-4 border-l-emerald-400">
            <p className="text-3xl font-bold text-slate-900">0</p>
            <p className="text-sm text-slate-500">Completed</p>
          </div>
        </div>

        {/* Opportunities */}
        {opportunities.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-3">🤝 Collaboration Opportunities</h2>
            <p className="text-sm text-slate-500 mb-3">Government-approved solutions seeking industry funding, technology, and implementation support.</p>
            <div className="space-y-3">
              {opportunities.map((p: any) => (
                <Link key={p.id} href={`/industry/collaborate/${p.project?.id}`} className="card p-5 flex items-start gap-4 hover:border-indigo-200 hover:shadow-sm transition-all block">
                  <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-400">{p.referenceId}</span>
                      <span className="badge badge-verified">Govt Approved</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">{p.title}</h3>
                    <p className="text-xs text-slate-500">{p.location}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">Technical Support</span>
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs">Funding</span>
                      <span className="px-2 py-1 bg-violet-50 text-violet-700 rounded text-xs">Implementation</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-xs text-indigo-600 font-medium flex items-center gap-1">
                    Collaborate <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All projects */}
        <div>
          <h2 className="text-base font-semibold text-slate-900 mb-3">All Available Projects</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="card p-5 animate-pulse h-20 bg-slate-50" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="card p-12 text-center">
              <Factory className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No approved projects available for collaboration yet.</p>
              <p className="text-xs text-slate-400 mt-1">Projects appear here after government solution validation.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((p: any) => (
                <Link key={p.id} href={`/problems/${p.id}`} className="card p-4 flex items-center gap-4 hover:border-slate-300 hover:shadow-sm transition-all block">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-slate-400">{p.referenceId}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-sm font-medium text-slate-700 truncate">{p.title}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
