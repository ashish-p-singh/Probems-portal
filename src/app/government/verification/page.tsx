'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import { ChevronRight, MapPin, Users, Clock, Flame } from 'lucide-react'
import { format } from 'date-fns'

export default function VerificationQueuePage() {
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/problems')
      .then((r) => r.json())
      .then((d) => {
        const filtered = (Array.isArray(d) ? d : []).filter((p: any) =>
          ['SUBMITTED', 'UNDER_VERIFICATION', 'ADDITIONAL_INFO_REQUIRED'].includes(p.status)
        )
        setProblems(filtered)
        setLoading(false)
      })
  }, [])

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verification Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Problems submitted by citizens awaiting government verification. Emergency incidents are pinned at the top.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="card p-5 animate-pulse h-20 bg-slate-50" />)}
          </div>
        ) : problems.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-slate-400">No problems pending verification.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {problems.map((p) => (
              <Link
                key={p.id}
                href={`/government/verification/${p.id}`}
                className={`card p-5 flex items-start gap-4 transition-all duration-150 block ${
                  p.isEmergency
                    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20 hover:border-rose-500'
                    : 'hover:border-indigo-200 hover:shadow-sm'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {p.isEmergency && (
                      <span className="font-bold text-[11px] bg-rose-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                        <Flame className="w-3 h-3" />
                        TOPMOST PRIORITY: EMERGENCY
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-400">{p.referenceId}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{p.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</span>
                    {p.affectedPopulation && <span className="flex items-center gap-1"><Users className="w-3 h-3" />~{p.affectedPopulation.toLocaleString()} affected</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(p.createdAt), 'dd MMM yyyy')}</span>
                  </div>
                </div>
                <div className={`flex-shrink-0 text-xs font-semibold flex items-center gap-1 mt-0.5 ${p.isEmergency ? 'text-rose-600' : 'text-indigo-600'}`}>
                  <span>{p.isEmergency ? 'Urgent Verify' : 'Verify'}</span> <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
