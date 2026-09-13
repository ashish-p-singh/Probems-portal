'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import {
  Briefcase, Search, Filter, Building2, GraduationCap,
  MapPin, CheckCircle2, ChevronRight, Clock, Layers, ArrowUpRight
} from 'lucide-react'

export default function GovernmentProjectsPage() {
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
      p.university?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.facultyAssignment?.faculty?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (filterStatus === 'ALL') return true
    if (filterStatus === 'IN_PROGRESS') return ['ACCEPTED', 'TEAM_FORMATION', 'IN_PROGRESS'].includes(p.status)
    if (filterStatus === 'SOLUTION_SUBMITTED') return ['SOLUTION_SUBMITTED', 'GOVERNMENT_REVIEW'].includes(p.status)
    if (filterStatus === 'APPROVED') return ['GOVERNMENT_APPROVED', 'INDUSTRY_COLLABORATION'].includes(p.status)
    if (filterStatus === 'IMPLEMENTATION') return ['IMPLEMENTATION', 'COMPLETED', 'IMPACT_MEASURED'].includes(p.status)
    return p.status === filterStatus
  })

  const inProgressCount = projects.filter((p) => ['ACCEPTED', 'TEAM_FORMATION', 'IN_PROGRESS'].includes(p.status)).length
  const submittedCount = projects.filter((p) => ['SOLUTION_SUBMITTED', 'GOVERNMENT_REVIEW'].includes(p.status)).length
  const approvedCount = projects.filter((p) => ['GOVERNMENT_APPROVED', 'INDUSTRY_COLLABORATION'].includes(p.status)).length
  const implementationCount = projects.filter((p) => ['IMPLEMENTATION', 'COMPLETED', 'IMPACT_MEASURED'].includes(p.status)).length

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/government/dashboard" className="hover:text-slate-900">Government</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Projects</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">University Solution Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor all ongoing civic projects being developed across participating universities.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4 border-l-4 border-l-blue-500">
            <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Total Projects</p>
          </div>
          <div className="card p-4 border-l-4 border-l-indigo-500">
            <p className="text-2xl font-bold text-indigo-700">{inProgressCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">In Development</p>
          </div>
          <div className="card p-4 border-l-4 border-l-amber-500">
            <p className="text-2xl font-bold text-amber-700">{submittedCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Solutions Submitted</p>
          </div>
          <div className="card p-4 border-l-4 border-l-emerald-500">
            <p className="text-2xl font-bold text-emerald-700">{approvedCount + implementationCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Approved & Implementing</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, ref ID, university, faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'ALL', label: `All (${projects.length})` },
              { key: 'IN_PROGRESS', label: `In Progress (${inProgressCount})` },
              { key: 'SOLUTION_SUBMITTED', label: `Submitted (${submittedCount})` },
              { key: 'APPROVED', label: `Approved (${approvedCount})` },
              { key: 'IMPLEMENTATION', label: `Implementing (${implementationCount})` },
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

        {/* Project List */}
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
                : 'No university projects have been accepted yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((proj) => {
              const completedMilestones = proj.milestones?.filter((m: any) => m.completedAt)?.length || 0
              const totalMilestones = proj.milestones?.length || 0
              const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

              return (
                <div key={proj.id} className="card p-5 hover:border-slate-300 transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {proj.problem?.referenceId || 'PROJECT'}
                        </span>
                        <StatusBadge status={proj.status} />
                        {proj.problem?.category && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {proj.problem.category.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-semibold text-slate-900 mb-1">
                        {proj.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="font-medium text-slate-700">{proj.university?.name || 'University'}</span>
                        </span>
                        {proj.facultyAssignment?.faculty?.name && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Faculty: {proj.facultyAssignment.faculty.name}</span>
                          </span>
                        )}
                        {proj.problem?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{proj.problem.location}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress and actions */}
                    <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 flex-shrink-0">
                      {totalMilestones > 0 && (
                        <div className="text-right">
                          <div className="text-xs text-slate-500 mb-1">
                            Milestones: <span className="font-semibold text-slate-700">{completedMilestones}/{totalMilestones}</span> ({progressPct}%)
                          </div>
                          <div className="w-32 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {['SOLUTION_SUBMITTED', 'GOVERNMENT_REVIEW'].includes(proj.status) && (
                          <Link
                            href="/government/validation"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                          >
                            Validate Solution <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <Link
                          href={`/problems/${proj.problemId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          View Problem <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
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
