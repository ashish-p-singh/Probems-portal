'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import {
  Building2, Briefcase, Plus, CheckCircle2, Clock,
  ArrowRight, DollarSign, FileText, ChevronRight
} from 'lucide-react'

export default function IndustryCollaborationsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => {
        setProjects(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // In real life this filters where collaborations include current user,
  // or displays all active industry partnerships for this demo.
  const activeCollabs = projects.filter((p) =>
    p.collaborations && p.collaborations.length > 0
  )

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/industry/dashboard" className="hover:text-slate-900">Industry</Link>
              <span>/</span>
              <span className="text-slate-700 font-medium">My Collaborations</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Industry Partnerships & Collaborations</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Active co-development programs, CSR commitments, and technical support across universities.
            </p>
          </div>
          <Link
            href="/industry/opportunities"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Browse New Opportunities
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4 border-l-4 border-l-indigo-500">
            <p className="text-2xl font-bold text-slate-900">{activeCollabs.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Active Partnerships</p>
          </div>
          <div className="card p-4 border-l-4 border-l-emerald-500">
            <p className="text-2xl font-bold text-emerald-700">
              ₹{projects.reduce((acc, p) => {
                const total = p.collaborations?.reduce((cAcc: number, c: any) => cAcc + (c.funding?.amountCommitted || 0), 0) || 0
                return acc + total
              }, 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Committed Funding & Grants</p>
          </div>
          <div className="card p-4 border-l-4 border-l-blue-500">
            <p className="text-2xl font-bold text-blue-700">
              {projects.filter((p) => ['IMPLEMENTATION', 'COMPLETED'].includes(p.status)).length}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">In Field Deployment</p>
          </div>
        </div>

        {/* Collaborations List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : activeCollabs.length === 0 ? (
          <div className="card p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No active collaborations yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Partner with universities on government-validated civic solutions to make real community impact.
            </p>
            <div className="mt-4">
              <Link href="/industry/opportunities" className="btn-primary inline-flex">
                Explore Available Opportunities
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeCollabs.map((p) => (
              <div key={p.id} className="card p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {p.problem?.referenceId}
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">{p.title}</h3>
                    <p className="text-xs text-slate-500 mb-3">University: <strong>{p.university?.name}</strong> • Location: {p.problem?.location}</p>

                    {/* Collaboration entries */}
                    <div className="space-y-2 mt-2">
                      {p.collaborations.map((collab: any) => (
                        <div key={collab.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                          <div className="text-xs">
                            <span className="font-semibold text-slate-800">{collab.collaborationType?.replace(/_/g, ' ')}</span>
                            {collab.description && <p className="text-slate-600 mt-0.5">{collab.description}</p>}
                          </div>
                          <span className="badge bg-emerald-100 text-emerald-800 text-xs font-medium">
                            {collab.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex md:flex-col items-end gap-2 flex-shrink-0">
                    <Link
                      href={`/industry/collaborate/${p.id}`}
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      Update Partnership <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
