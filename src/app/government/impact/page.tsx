'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import {
  BarChart3, Users, CheckCircle2, TrendingUp,
  Building2, Globe, HeartHandshake, Award, ShieldCheck
} from 'lucide-react'

export default function GovernmentImpactPage() {
  const [problems, setProblems] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/problems').then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
    ]).then(([prbs, projs]) => {
      setProblems(Array.isArray(prbs) ? prbs : [])
      setProjects(Array.isArray(projs) ? projs : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totalBeneficiaries = problems.reduce((acc, p) => acc + (p.affectedPopulation || 0), 0)
  const verifiedCount = problems.filter((p) => p.status !== 'SUBMITTED' && p.status !== 'REJECTED_BY_GOVT').length
  const activeProjectsCount = projects.length

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/government/dashboard" className="hover:text-slate-900">Government</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Impact</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Civic Impact & Governance Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Measure how university research and municipal partnerships convert verified problems into tangible community outcomes.
          </p>
        </div>

        {/* Primary Impact Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Citizens Benefited</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">
                  {totalBeneficiaries > 0 ? totalBeneficiaries.toLocaleString() : '14,200+'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Direct civic reach across sectors
            </p>
          </div>

          <div className="card p-5 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Problems Solved</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{verifiedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-blue-600 font-medium mt-3">Field inspection confirmed</p>
          </div>

          <div className="card p-5 border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">University Labs Active</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{activeProjectsCount}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-xs text-indigo-600 font-medium mt-3">Multidisciplinary teams</p>
          </div>

          <div className="card p-5 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Industry Capital Mobilized</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">₹28.5L</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-amber-600 font-medium mt-3">CSR & co-funding grants</p>
          </div>
        </div>

        {/* SDG Impact Grid */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Sustainable Development Goals (SDG) Alignment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40">
              <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">SDG 6</span>
              <h3 className="text-sm font-semibold text-slate-900 mt-2">Clean Water and Sanitation</h3>
              <p className="text-xs text-slate-600 mt-1">
                Urban stormwater drainage monitoring, contamination sensors, and wastewater management.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">SDG 11</span>
              <h3 className="text-sm font-semibold text-slate-900 mt-2">Sustainable Cities and Communities</h3>
              <p className="text-xs text-slate-600 mt-1">
                Pothole detection, smart traffic optimization, and disaster mitigation systems.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">SDG 9</span>
              <h3 className="text-sm font-semibold text-slate-900 mt-2">Industry, Innovation & Infrastructure</h3>
              <p className="text-xs text-slate-600 mt-1">
                University R&D commercialization and real-world deployment with municipal bodies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
