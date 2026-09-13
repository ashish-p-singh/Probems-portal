'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import {
  Users, GraduationCap, Briefcase, Plus, Search,
  CheckCircle2, ArrowRight, Layers
} from 'lucide-react'

export default function UniversityTeamsPage() {
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
    const matches =
      p.team?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.facultyAssignment?.faculty?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matches
  })

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/university/dashboard" className="hover:text-slate-900">University</Link>
              <span>/</span>
              <span className="text-slate-700 font-medium">Teams</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">University Project Teams</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Multidisciplinary student teams and assigned faculty mentors driving civic solutions.
            </p>
          </div>
          <Link
            href="/university/projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors self-start sm:self-auto"
          >
            <Briefcase className="w-4 h-4" />
            View All Projects
          </Link>
        </div>

        {/* Filter */}
        <div className="card p-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by team name, project title, faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              Teams are automatically formed and managed inside each project workspace.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((proj) => (
              <div key={proj.id} className="card p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {proj.problem?.referenceId}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                        {proj.team?.name || `Team ${proj.title.split(' ')[0]}`}
                      </h3>
                    </div>
                    <span className="badge bg-slate-100 text-slate-700 text-xs">
                      {proj.team?._count?.members || 2} members
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    Assigned Project: <strong className="text-slate-800">{proj.title}</strong>
                  </p>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>
                        Faculty Leader: <strong className="text-slate-800">{proj.facultyAssignment?.faculty?.name || 'Assigned Professor'}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>Disciplines: Civil Engineering, Computer Science, IoT, Environmental Science</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Status: {proj.status}</span>
                  <Link
                    href={`/university/projects/${proj.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Team Workspace <ArrowRight className="w-3.5 h-3.5" />
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
