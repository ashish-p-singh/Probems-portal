'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import {
  Briefcase, Search, Users, CheckCircle2,
  ChevronRight, AlertCircle, ArrowRight, Layers, FileText
} from 'lucide-react'

export default function FacultyProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => {
        setProjects(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.problem?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.problem?.referenceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.team?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (filterStatus === 'ALL') return true
    if (filterStatus === 'IN_PROGRESS') return ['ACCEPTED', 'TEAM_FORMATION', 'IN_PROGRESS'].includes(p.status)
    if (filterStatus === 'NEEDS_ACTION') return ['CHANGES_REQUESTED'].includes(p.status)
    if (filterStatus === 'SOLUTION_SUBMITTED') return ['SOLUTION_SUBMITTED', 'GOVERNMENT_REVIEW'].includes(p.status)
    if (filterStatus === 'APPROVED') return ['GOVERNMENT_APPROVED', 'INDUSTRY_COLLABORATION', 'IMPLEMENTATION'].includes(p.status)
    return p.status === filterStatus
  })

  const inProgressCount = projects.filter((p) => ['ACCEPTED', 'TEAM_FORMATION', 'IN_PROGRESS'].includes(p.status)).length
  const needsActionCount = projects.filter((p) => ['CHANGES_REQUESTED'].includes(p.status)).length
  const submittedCount = projects.filter((p) => ['SOLUTION_SUBMITTED', 'GOVERNMENT_REVIEW'].includes(p.status)).length
  const approvedCount = projects.filter((p) => ['GOVERNMENT_APPROVED', 'INDUSTRY_COLLABORATION', 'IMPLEMENTATION'].includes(p.status)).length

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/faculty/dashboard" className="hover:text-slate-900">Faculty</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">My Projects</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">My Mentored Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Oversee project milestones, guide student research, and submit technical solutions for government review.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4 border-l-4 border-l-indigo-500">
            <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Total Mentored</p>
          </div>
          <div className="card p-4 border-l-4 border-l-blue-500">
            <p className="text-2xl font-bold text-blue-700">{inProgressCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">In Development</p>
          </div>
          <div className="card p-4 border-l-4 border-l-amber-500">
            <p className="text-2xl font-bold text-amber-700">{needsActionCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Action Needed</p>
          </div>
          <div className="card p-4 border-l-4 border-l-emerald-500">
            <p className="text-2xl font-bold text-emerald-700">{approvedCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Approved</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, reference ID, team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'ALL', label: `All (${projects.length})` },
              { key: 'IN_PROGRESS', label: `In Progress (${inProgressCount})` },
              { key: 'NEEDS_ACTION', label: `Needs Action (${needsActionCount})` },
              { key: 'SOLUTION_SUBMITTED', label: `Submitted (${submittedCount})` },
              { key: 'APPROVED', label: `Approved (${approvedCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  filterStatus === tab.key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects List */}
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
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No projects found</h3>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || filterStatus !== 'ALL'
                ? 'No projects match your current filters.'
                : 'No projects are assigned to you yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((proj) => {
              const completedMilestones = proj.milestones?.filter((m: any) => m.completedAt)?.length || 0
              const totalMilestones = proj.milestones?.length || 0
              const memberCount = proj.team?._count?.members || 0
              const taskCount = proj._count?.tasks || 0
              const isActionNeeded = proj.status === 'CHANGES_REQUESTED'

              return (
                <div
                  key={proj.id}
                  className={`card p-5 transition-all ${
                    isActionNeeded ? 'border-amber-300 bg-amber-50/20' : 'hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {proj.problem?.referenceId || 'PROJECT'}
                        </span>
                        <StatusBadge status={proj.status} />
                        {isActionNeeded && (
                          <span className="badge bg-red-100 text-red-700 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Government Feedback Requires Revision
                          </span>
                        )}
                        {proj.problem?.category && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {proj.problem.category.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-semibold text-slate-900 mb-1">
                        {proj.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Team: <strong>{proj.team?.name || 'Assigned Students'}</strong> ({memberCount} members)</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Milestones: {completedMilestones}/{totalMilestones}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span>Tasks: {taskCount}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
                      <Link
                        href={`/faculty/projects/${proj.id}`}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-colors ${
                          isActionNeeded
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isActionNeeded ? 'Review Govt Comments' : 'Open Workspace'}{' '}
                        <ArrowRight className="w-3.5 h-3.5" />
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
