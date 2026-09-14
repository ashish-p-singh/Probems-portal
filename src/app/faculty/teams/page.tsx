'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import {
  Users, GraduationCap, Briefcase, Search,
  ArrowRight, Layers, Award
} from 'lucide-react'

export default function FacultyTeamsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
    const q = searchQuery.toLowerCase()
    return (
      p.team?.name?.toLowerCase().includes(q) ||
      p.title?.toLowerCase().includes(q) ||
      p.facultyAssignment?.faculty?.name?.toLowerCase().includes(q) ||
      p.team?.members?.some((m: any) => m.user?.name?.toLowerCase().includes(q))
    )
  })

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/faculty/dashboard" className="hover:text-slate-900">Faculty</Link>
              <span>/</span>
              <span className="text-slate-700 font-medium">Teams</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Research & Student Teams</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Multidisciplinary student teams, research pods, and assigned projects under your academic guidance.
            </p>
          </div>
          <Link
            href="/faculty/projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors self-start sm:self-auto"
          >
            <Briefcase className="w-4 h-4" />
            View My Projects
          </Link>
        </div>

        {/* Filter */}
        <div className="card p-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by team name, student name, project title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Teams List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/2 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No teams found</h3>
            <p className="text-sm text-slate-500 mt-1">
              Select or assemble student teams inside each project workspace.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((proj) => (
              <div key={proj.id} className="card p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
                        {proj.problem?.referenceId}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                        {proj.team?.name || `${proj.title} Squad`}
                      </h3>
                    </div>
                    <span className="badge bg-slate-100 text-slate-700 text-xs">
                      {proj.team?.members?.length || proj.team?._count?.members || 0} student researchers
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    Project: <strong className="text-slate-800">{proj.title}</strong>
                  </p>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-violet-600 flex-shrink-0" />
                      <span>
                        Faculty Advisor: <strong className="text-slate-800">{proj.facultyAssignment?.faculty?.name || 'Assigned Faculty'}</strong>
                      </span>
                    </div>
                    {proj.team?.members && proj.team.members.length > 0 && (
                      <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60">
                        <Users className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 flex flex-wrap gap-1">
                          {proj.team.members.map((m: any) => (
                            <span key={m.id} className="inline-block bg-white px-2 py-0.5 rounded border text-[11px] text-slate-700 font-medium">
                              {m.user?.name} ({m.role})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Status: {proj.status}</span>
                  <Link
                    href={`/faculty/projects/${proj.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
                  >
                    Manage Team & Solution <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
