'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import {
  Briefcase, Search, Users, GraduationCap,
  Calendar, CheckCircle2, ChevronRight, Layers, Plus, ArrowRight
} from 'lucide-react'

export default function UniversityProjectsPage() {
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
      p.facultyAssignment?.faculty?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.team?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (filterStatus === 'ALL') return true
    if (filterStatus === 'TEAM_FORMATION') return ['ACCEPTED', 'TEAM_FORMATION'].includes(p.status)
    if (filterStatus === 'IN_PROGRESS') return p.status === 'IN_PROGRESS'
    if (filterStatus === 'SOLUTION_SUBMITTED') return ['SOLUTION_SUBMITTED', 'GOVERNMENT_REVIEW'].includes(p.status)
    if (filterStatus === 'APPROVED') return ['GOVERNMENT_APPROVED', 'INDUSTRY_COLLABORATION', 'IMPLEMENTATION'].includes(p.status)
    return p.status === filterStatus
  })

  const teamFormationCount = projects.filter((p) => ['ACCEPTED', 'TEAM_FORMATION'].includes(p.status)).length
  const inProgressCount = projects.filter((p) => p.status === 'IN_PROGRESS').length
  const solutionCount = projects.filter((p) => ['SOLUTION_SUBMITTED', 'GOVERNMENT_REVIEW'].includes(p.status)).length
  const approvedCount = projects.filter((p) => ['GOVERNMENT_APPROVED', 'INDUSTRY_COLLABORATION', 'IMPLEMENTATION'].includes(p.status)).length

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/university/dashboard" className="hover:text-slate-900">University</Link>
              <span>/</span>
              <span className="text-slate-700 font-medium">Projects</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">University Projects</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage student teams, faculty leaders, and solution development lifecycles.
            </p>
          </div>
          <Link
            href="/university/problems"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Accept Verified Problems
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4 border-l-4 border-l-indigo-500">
            <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Total Projects</p>
          </div>
          <div className="card p-4 border-l-4 border-l-amber-500">
            <p className="text-2xl font-bold text-amber-700">{teamFormationCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Team Formation</p>
          </div>
          <div className="card p-4 border-l-4 border-l-blue-500">
            <p className="text-2xl font-bold text-blue-700">{inProgressCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">In Progress</p>
          </div>
          <div className="card p-4 border-l-4 border-l-emerald-500">
            <p className="text-2xl font-bold text-emerald-700">{approvedCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Approved & Partnered</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, team, faculty leader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'ALL', label: `All (${projects.length})` },
              { key: 'TEAM_FORMATION', label: `Team Setup (${teamFormationCount})` },
              { key: 'IN_PROGRESS', label: `In Progress (${inProgressCount})` },
              { key: 'SOLUTION_SUBMITTED', label: `Submitted (${solutionCount})` },
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
                ? 'No projects match your filter criteria.'
                : 'Start by reviewing and accepting verified problems from the government.'}
            </p>
            <div className="mt-4">
              <Link href="/university/problems" className="btn-primary inline-flex">
                Browse Verified Problems
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((proj) => {
              const completedMilestones = proj.milestones?.filter((m: any) => m.completedAt)?.length || 0
              const totalMilestones = proj.milestones?.length || 0
              const memberCount = proj.team?._count?.members || 0
              const taskCount = proj._count?.tasks || 0

              return (
                <div key={proj.id} className="card p-5 hover:border-slate-300 hover:shadow-sm transition-all">
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

                      {proj.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                          {proj.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Faculty: <strong>{proj.facultyAssignment?.faculty?.name || 'Not Assigned'}</strong></span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Team: <strong>{proj.team?.name || 'Unassigned'}</strong> ({memberCount} members)</span>
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
                        href={`/university/projects/${proj.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                      >
                        Project Workspace <ArrowRight className="w-3.5 h-3.5" />
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
