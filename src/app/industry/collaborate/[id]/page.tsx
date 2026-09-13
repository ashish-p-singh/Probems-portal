'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import { CheckCircle, XCircle, AlertCircle, Loader2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function IndustryCollaboratePage() {
  const { id } = useParams() // project id
  const { data: session } = useSession()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    collaborationType: 'TECHNICAL_SUPPORT',
    description: '',
    amount: '',
    purpose: '',
  })
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((d) => { setProject(d); setLoading(false) })
  }, [id])

  const expressInterest = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/projects/${id}/collaborate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'EXPRESS_INTEREST', ...form }),
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/industry/dashboard'), 2500)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <DashboardShell><div className="page-content"><div className="animate-pulse h-96 bg-slate-100 rounded-xl" /></div></DashboardShell>
  if (!project || project.error) return <DashboardShell><div className="page-content"><p className="text-slate-500">Project not found.</p></div></DashboardShell>

  const collabTypes = [
    { value: 'TECHNICAL_SUPPORT', label: 'Technical Support', desc: 'Technology, engineering expertise, tools, software' },
    { value: 'FUNDING', label: 'Funding', desc: 'Financial support for development, prototype, deployment' },
    { value: 'PRACTICAL_SUPPORT', label: 'Practical Support', desc: 'Equipment, deployment assistance, workshops' },
    { value: 'IMPLEMENTATION_PARTNERSHIP', label: 'Implementation Partnership', desc: 'Direct collaboration on deployment' },
  ]

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        <div>
          <Link href="/industry/dashboard" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
            <ChevronLeft className="w-4 h-4" />Back to opportunities
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Express Collaboration Interest</h1>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
            <CheckCircle className="w-4 h-4" />Interest submitted successfully. The university will review your request.
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {/* Project summary */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-slate-900">Project</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-slate-400">{project.problem?.referenceId}</span>
                <span className="badge badge-verified">Government Approved</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-2">{project.problem?.title}</h2>
              <p className="text-sm text-slate-500 mb-4">{project.problem?.location}</p>

              {project.solution && (
                <div className="space-y-3 border-t border-slate-50 pt-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Proposed Solution</p>
                    <p className="text-sm text-slate-700">{project.solution.proposedSolution}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Expected Impact</p>
                    <p className="text-sm text-slate-700">{project.solution.expectedImpact}</p>
                  </div>
                  {project.solution.estimatedCost && (
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Estimated Cost</p>
                      <p className="text-sm font-semibold text-slate-900">₹{project.solution.estimatedCost.toLocaleString('en-IN')}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Sustainability Plan</p>
                    <p className="text-sm text-slate-700">{project.solution.sustainabilityPlan}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Collaboration form */}
            <div className="card p-6 space-y-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">Your Collaboration Offer</h3>

              <div>
                <label className="label">Collaboration Type</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {collabTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, collaborationType: t.value }))}
                      className={`p-3 border rounded-xl text-left transition-all ${form.collaborationType === t.value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <p className={`text-sm font-medium ${form.collaborationType === t.value ? 'text-indigo-700' : 'text-slate-900'}`}>{t.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Description of Support Offered</label>
                <textarea
                  className="textarea"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe what you can offer: technology, expertise, resources, implementation support..."
                />
              </div>

              {form.collaborationType === 'FUNDING' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Amount (INR)</label>
                    <input
                      className="input"
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                      placeholder="e.g. 500000"
                    />
                  </div>
                  <div>
                    <label className="label">Funding Purpose</label>
                    <input
                      className="input"
                      value={form.purpose}
                      onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                      placeholder="e.g. Prototype, Deployment"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={expressInterest}
                  disabled={submitting || !form.description || success}
                  className="btn-primary"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Express Interest
                </button>
                <Link href="/industry/dashboard" className="btn-secondary">Cancel</Link>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <div className="card p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4">Workflow</h3>
              <WorkflowTimeline currentStatus={project.problem?.status || 'APPROVED'} />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
