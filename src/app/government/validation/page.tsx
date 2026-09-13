'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import { ChevronRight, Clock, CheckCircle, Shield, Loader2, XCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

// This page fetches projects with submitted solutions and allows government to validate
export default function GovernmentValidationPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => {
        const filtered = (Array.isArray(d) ? d : []).filter((p: any) =>
          ['SOLUTION_SUBMITTED', 'CHANGES_REQUESTED'].includes(p.status)
        )
        setProjects(filtered)
        setLoading(false)
      })
  }, [])

  const validate = async (projectId: string, action: string) => {
    setValidating(projectId)
    try {
      await fetch(`/api/projects/${projectId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, feedback: feedback[projectId] }),
      })
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
    } finally {
      setValidating(null)
    }
  }

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Solution Validation</h1>
          <p className="text-sm text-slate-500 mt-1">Review and validate university-proposed solutions.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="card p-6 animate-pulse h-32 bg-slate-50" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="card p-12 text-center">
            <Shield className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No solutions pending validation.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((proj) => (
              <div key={proj.id} className="card p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400">{proj.problem?.referenceId}</span>
                    <StatusBadge status={proj.status} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{proj.problem?.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{proj.problem?.location}</p>
                </div>

                <Link href={`/problems/${proj.problem?.id}`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                  View full project details <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <div>
                  <label className="label">Validation Feedback / Decision Notes</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    placeholder="Provide feedback for the university team..."
                    value={feedback[proj.id] || ''}
                    onChange={(e) => setFeedback((f) => ({ ...f, [proj.id]: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => validate(proj.id, 'APPROVE')}
                    disabled={validating === proj.id}
                    className="btn-success"
                  >
                    {validating === proj.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Approve Solution
                  </button>
                  <button
                    onClick={() => validate(proj.id, 'REQUEST_CHANGES')}
                    disabled={validating === proj.id || !feedback[proj.id]}
                    className="btn-secondary"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Request Changes
                  </button>
                  <button
                    onClick={() => validate(proj.id, 'REJECT')}
                    disabled={validating === proj.id || !feedback[proj.id]}
                    className="btn-danger"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
