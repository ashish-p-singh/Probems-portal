'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import {
  Briefcase, Search, Building2, GraduationCap, MapPin,
  Users, CheckCircle2, DollarSign, Cpu, ArrowRight,
  TrendingUp, Sparkles, Filter, Factory
} from 'lucide-react'

export default function IndustryOpportunitiesPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => {
        setProjects(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Filter opportunities
  const opportunities = projects.filter((p) => {
    // Show projects that have a solution, or are in development/approved/implementation
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.problem?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.problem?.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.university?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.problem?.referenceId?.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (categoryFilter !== 'ALL' && p.problem?.category !== categoryFilter) {
      return false
    }

    if (stageFilter === 'ALL') return true
    if (stageFilter === 'APPROVED') {
      return ['GOVERNMENT_APPROVED', 'APPROVED', 'INDUSTRY_COLLABORATION'].includes(p.status)
    }
    if (stageFilter === 'IN_DEV') {
      return ['IN_PROGRESS', 'SOLUTION_SUBMITTED', 'GOVERNMENT_REVIEW'].includes(p.status)
    }
    if (stageFilter === 'IMPLEMENTATION') {
      return ['IMPLEMENTATION', 'COMPLETED'].includes(p.status)
    }
    return true
  })

  const approvedCount = projects.filter((p) =>
    ['GOVERNMENT_APPROVED', 'APPROVED', 'INDUSTRY_COLLABORATION'].includes(p.status)
  ).length

  const inDevCount = projects.filter((p) =>
    ['IN_PROGRESS', 'SOLUTION_SUBMITTED', 'GOVERNMENT_REVIEW'].includes(p.status)
  ).length

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/industry/dashboard" className="hover:text-slate-900">Industry</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Opportunities</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Civic Collaboration Opportunities</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Explore university-engineered solutions verified by municipal governments ready for corporate co-funding and deployment.
              </p>
            </div>
            <Link
              href="/industry/collaborations"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-lg transition-colors self-start sm:self-auto"
            >
              My Collaborations <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4 border-l-4 border-l-amber-500">
            <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Total Opportunities</p>
          </div>
          <div className="card p-4 border-l-4 border-l-emerald-500">
            <p className="text-2xl font-bold text-emerald-700">{approvedCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Govt Approved (Ready)</p>
          </div>
          <div className="card p-4 border-l-4 border-l-blue-500">
            <p className="text-2xl font-bold text-blue-700">{inDevCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Co-Innovation Stage</p>
          </div>
          <div className="card p-4 border-l-4 border-l-indigo-500">
            <p className="text-2xl font-bold text-indigo-700">100%</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">CSR / ESG Eligible</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="card p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, location, university, ref ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { key: 'ALL', label: `All (${projects.length})` },
                { key: 'APPROVED', label: `Govt Approved (${approvedCount})` },
                { key: 'IN_DEV', label: `In Development (${inDevCount})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStageFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    stageFilter === tab.key
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Opportunity Cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="card p-12 text-center">
            <Factory className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No opportunities match</h3>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your search criteria or filter options.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {opportunities.map((proj) => {
              const sol = proj.solution
              const existingCollabCount = proj.collaborations?.length || 0

              return (
                <div key={proj.id} className="card p-6 hover:border-indigo-200 hover:shadow-md transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Main content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {proj.problem?.referenceId || 'CIVIC-OPP'}
                        </span>
                        <StatusBadge status={proj.status} />
                        {proj.problem?.category && (
                          <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                            {proj.problem.category.replace(/_/g, ' ')}
                          </span>
                        )}
                        {['GOVERNMENT_APPROVED', 'APPROVED', 'INDUSTRY_COLLABORATION'].includes(proj.status) && (
                          <span className="badge badge-verified text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Municipal Validated
                          </span>
                        )}
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-slate-900 leading-snug">
                          {proj.title}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                            {proj.university?.name || 'University Research Lab'}
                          </span>
                          {proj.problem?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {proj.problem.location}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Problem and Solution highlight */}
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-2">
                        {sol?.proposedSolution ? (
                          <div>
                            <span className="text-xs font-semibold text-slate-700">Proposed Engineering Solution: </span>
                            <span className="text-xs text-slate-600">{sol.proposedSolution}</span>
                          </div>
                        ) : proj.description ? (
                          <div>
                            <span className="text-xs font-semibold text-slate-700">Project Scope: </span>
                            <span className="text-xs text-slate-600">{proj.description}</span>
                          </div>
                        ) : null}

                        {sol?.technicalApproach && (
                          <div className="pt-1.5 border-t border-slate-200/60">
                            <span className="text-xs font-semibold text-slate-700">Technical Stack & Approach: </span>
                            <span className="text-xs text-slate-600">{sol.technicalApproach}</span>
                          </div>
                        )}
                      </div>

                      {/* Collaboration Tags & Needs */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs text-slate-400 font-medium">Partnership Modes:</span>
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-medium rounded text-xs">
                          Technical Mentorship
                        </span>
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-medium rounded text-xs">
                          CSR Funding
                        </span>
                        <span className="px-2.5 py-1 bg-violet-50 text-violet-700 font-medium rounded text-xs">
                          Hardware & Pilot Testing
                        </span>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-medium rounded text-xs">
                          Implementation Partner
                        </span>
                      </div>
                    </div>

                    {/* Right side CTA card */}
                    <div className="lg:w-64 flex-shrink-0 bg-slate-50/70 p-4 rounded-xl border border-slate-200 flex flex-col justify-between gap-4">
                      <div className="space-y-2.5">
                        {sol?.estimatedCost && (
                          <div>
                            <p className="text-xs text-slate-400 font-medium">Estimated Project Budget</p>
                            <p className="text-base font-bold text-slate-900">
                              ₹{Number(sol.estimatedCost).toLocaleString('en-IN')}
                            </p>
                          </div>
                        )}

                        {existingCollabCount > 0 && (
                          <div>
                            <p className="text-xs text-slate-400 font-medium">Confirmed Partners</p>
                            <p className="text-xs font-semibold text-indigo-700 mt-0.5">
                              {existingCollabCount} industry partner(s) involved
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-slate-500 space-y-1">
                          <p className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tax Benefit (80G / CSR)</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Joint IP & Recognition</span>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Link
                          href={`/industry/collaborate/${proj.id}`}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors text-center"
                        >
                          Express Collaboration Interest <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/problems/${proj.problemId}`}
                          className="w-full inline-flex items-center justify-center px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 text-xs font-medium rounded-lg transition-colors text-center"
                        >
                          View Full Problem Record
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
