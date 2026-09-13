'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import { MapPin, Users, CheckCircle, XCircle, AlertCircle, Loader2, ChevronLeft } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default function VerificationPage() {
  const { id } = useParams()
  const router = useRouter()
  const [problem, setProblem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [remarks, setRemarks] = useState('')
  const [municipalityInput, setMunicipalityInput] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetch(`/api/problems/${id}`)
      .then((r) => r.json())
      .then((d) => { setProblem(d); setLoading(false) })
  }, [id])

  const act = async (action: string) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/problems/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, remarks, municipalityInput }),
      })
      if (res.ok) {
        const d = await res.json()
        setSuccess(`Action "${action}" completed. Status: ${d.newStatus}`)
        setTimeout(() => router.push('/government/dashboard'), 2000)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <DashboardShell><div className="page-content"><div className="animate-pulse h-64 bg-slate-100 rounded-xl" /></div></DashboardShell>
  if (!problem || problem.error) return <DashboardShell><div className="page-content"><p className="text-slate-500">Problem not found.</p></div></DashboardShell>

  const canVerify = ['SUBMITTED', 'UNDER_VERIFICATION', 'ADDITIONAL_INFO_REQUIRED'].includes(problem.status)

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        <div>
          <Link href="/government/verification" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
            <ChevronLeft className="w-4 h-4" />Back to queue
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-sm font-mono text-slate-400">{problem.referenceId}</span>
            <StatusBadge status={problem.status} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">{problem.title}</h1>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
            <CheckCircle className="w-4 h-4" />{success}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Problem details */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Problem */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4">Problem</h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">{problem.description}</p>
              <div className="grid grid-cols-2 gap-y-2 text-sm pt-4 border-t border-slate-50">
                <div className="text-slate-500">Location</div><div className="font-medium">{problem.location}</div>
                {problem.municipality && <><div className="text-slate-500">Municipality</div><div className="font-medium">{problem.municipality}</div></>}
                {problem.district && <><div className="text-slate-500">District</div><div className="font-medium">{problem.district}</div></>}
                <div className="text-slate-500">State</div><div className="font-medium">{problem.state}</div>
                {problem.affectedPopulation && <><div className="text-slate-500">Affected Population</div><div className="font-medium">~{problem.affectedPopulation.toLocaleString()}</div></>}
                <div className="text-slate-500">Submitted by</div><div className="font-medium">{problem.citizen?.name}</div>
                <div className="text-slate-500">Submitted on</div><div className="font-medium">{format(new Date(problem.createdAt), 'dd MMM yyyy')}</div>
              </div>
            </div>

            {/* Evidence */}
            {problem.evidence?.length > 0 && (
              <div className="card p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4">Evidence ({problem.evidence.length} files)</h3>
                <div className="flex gap-2 flex-wrap">
                  {problem.evidence.map((e: any) => (
                    <div key={e.id} className="px-3 py-2 bg-slate-50 rounded-lg border text-xs text-slate-600 flex items-center gap-1.5">
                      📎 {e.fileName}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification form */}
            {canVerify && (
              <div className="card p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4">Verification Decision</h3>

                <div className="space-y-4">
                  <div>
                    <label className="label">Municipality / Panchayat Input</label>
                    <textarea
                      className="textarea"
                      value={municipalityInput}
                      onChange={(e) => setMunicipalityInput(e.target.value)}
                      rows={3}
                      placeholder="Describe findings from municipality/panchayat consultation..."
                    />
                  </div>
                  <div>
                    <label className="label">Verification Remarks *</label>
                    <textarea
                      className="textarea"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={4}
                      placeholder="Provide official remarks for verification decision..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    {problem.status === 'SUBMITTED' && (
                      <button onClick={() => act('START_VERIFICATION')} disabled={submitting} className="btn-secondary">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Start Verification
                      </button>
                    )}
                    <button onClick={() => act('VERIFY')} disabled={submitting || !remarks} className="btn-success">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Verify Problem
                    </button>
                    <button onClick={() => act('REQUEST_INFO')} disabled={submitting} className="btn-secondary">
                      Request More Info
                    </button>
                    <button onClick={() => act('REJECT')} disabled={submitting || !remarks} className="btn-danger">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )}

            {problem.status === 'VERIFIED' && (
              <div className="card p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4">Forward to University</h3>
                <p className="text-sm text-slate-500 mb-4">
                  This problem has been verified. Forward it to universities for review and solution development.
                </p>
                <button onClick={() => act('FORWARD_TO_UNIVERSITY')} disabled={submitting} className="btn-primary">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Forward to Universities
                </button>
              </div>
            )}
          </div>

          {/* Workflow sidebar */}
          <div className="col-span-12 lg:col-span-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4">Workflow</h3>
              <WorkflowTimeline currentStatus={problem.status} />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
