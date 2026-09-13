'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import { CheckCircle, Clock, ChevronLeft, Loader2, AlertCircle, FileText } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { FileUpload, UploadedFile } from '@/components/ui/FileUpload'

export default function FacultyProjectPage() {
  const { id } = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'tasks' | 'milestones' | 'solution' | 'feedback'>('overview')

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((d) => { setProject(d); setLoading(false) })
  }, [id])

  const handleDocumentUpload = async (uploaded: UploadedFile[]) => {
    if (uploaded.length === 0) return
    for (const f of uploaded) {
      const exists = project?.documents?.some((d: any) => d.fileUrl === f.url)
      if (!exists) {
        await fetch(`/api/projects/${id}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: f.fileName,
            fileUrl: f.url,
            fileName: f.fileName,
            fileType: f.fileType,
            documentType: 'prototype',
          }),
        })
      }
    }
    const r = await fetch(`/api/projects/${id}`)
    setProject(await r.json())
  }

  const act = async (action: string, extra?: any) => {
    setSubmitting(true)
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      const r = await fetch(`/api/projects/${id}`)
      setProject(await r.json())
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <DashboardShell><div className="page-content"><div className="animate-pulse h-96 bg-slate-100 rounded-xl" /></div></DashboardShell>
  if (!project || project.error) return <DashboardShell><div className="page-content"><p className="text-slate-500">Project not found.</p></div></DashboardShell>

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'team', label: 'Team' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'milestones', label: 'Milestones' },
    { key: 'solution', label: 'Solution' },
    { key: 'feedback', label: 'Govt Feedback' },
  ]

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        <div>
          <Link href="/faculty/dashboard" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
            <ChevronLeft className="w-4 h-4" />Back to dashboard
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-400">{project.problem?.referenceId}</span>
            <StatusBadge status={project.status} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">{project.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Faculty Leader View</p>
        </div>

        {project.status === 'CHANGES_REQUESTED' && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Government has requested changes</p>
              {project.validation?.feedback && (
                <p className="text-sm text-amber-700 mt-1">{project.validation.feedback}</p>
              )}
              <button onClick={() => act('SUBMIT_SOLUTION')} disabled={submitting} className="btn-primary mt-3 text-sm">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Resubmit Solution
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit flex-wrap">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="card p-6 space-y-4">
                <p className="text-sm text-slate-700">{project.problem?.description}</p>
                <div className="pt-3 border-t border-slate-50 grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-slate-500">Location</span><span className="font-medium">{project.problem?.location}</span>
                  {project.problem?.affectedPopulation && <><span className="text-slate-500">Affected</span><span className="font-medium">~{project.problem.affectedPopulation.toLocaleString()}</span></>}
                </div>
                {project.problem?.verification?.status === 'VERIFIED' && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-xs font-medium text-emerald-700 mb-1">✓ Government Verified</p>
                    <p className="text-xs text-emerald-600">{project.problem.verification.remarks}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  {project.status === 'IN_PROGRESS' && project.solution?.status === 'DRAFT' && (
                    <button onClick={() => act('SUBMIT_SOLUTION')} disabled={submitting} className="btn-success">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Submit Solution to Government
                    </button>
                  )}
                  <Link href={`/problems/${project.problem?.id}`} className="btn-secondary">View Full Problem</Link>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="card p-6 space-y-3">
                {project.facultyAssignment && (
                  <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-lg border border-violet-100">
                    <div className="w-8 h-8 bg-violet-200 rounded-full flex items-center justify-center font-bold text-violet-700 text-sm">
                      FL
                    </div>
                    <div>
                      <p className="text-sm font-medium">{project.facultyAssignment.faculty?.name}</p>
                      <p className="text-xs text-violet-600">Faculty Leader · {project.facultyAssignment.faculty?.faculty?.department}</p>
                    </div>
                  </div>
                )}
                {project.team?.members?.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-medium text-indigo-700">
                      {m.user.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{m.user.name}</p>
                      <p className="text-xs text-slate-500">{m.role} · {m.discipline}</p>
                      {m.responsibilities && <p className="text-xs text-slate-400 mt-0.5">{m.responsibilities}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="card p-6">
                <div className="grid grid-cols-4 gap-3">
                  {['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].map((status) => {
                    const tasks = (project.tasks || []).filter((t: any) => t.status === status)
                    const labels: Record<string, string> = { TODO: 'To Do', IN_PROGRESS: 'In Progress', REVIEW: 'Review', COMPLETED: 'Completed' }
                    return (
                      <div key={status} className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-slate-600">{labels[status]}</p>
                          <span className="text-xs text-slate-400">{tasks.length}</span>
                        </div>
                        <div className="space-y-2">
                          {tasks.map((t: any) => (
                            <div key={t.id} className="bg-white rounded-lg p-2 border text-xs text-slate-700">
                              {t.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === 'milestones' && (
              <div className="card p-6">
                <div className="space-y-3">
                  {(project.milestones || []).map((m: any, i: number) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.completedAt ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        {m.completedAt ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <span className="text-xs text-slate-500">{i + 1}</span>}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${m.completedAt ? 'font-medium text-slate-700' : 'text-slate-500'}`}>{m.title}</p>
                      </div>
                      {m.completedAt ? (
                        <span className="text-xs text-emerald-600">{format(new Date(m.completedAt), 'dd MMM')}</span>
                      ) : m.dueDate ? (
                        <span className="text-xs text-slate-400">Due {format(new Date(m.dueDate), 'dd MMM')}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'solution' && (
              <div className="space-y-6">
                <div className="card p-6">
                  {!project.solution ? (
                    <p className="text-center text-slate-400 text-sm py-6">No solution data yet.</p>
                  ) : (
                    <div className="space-y-4">
                      <StatusBadge status={project.solution.status} />
                      {[
                        { label: 'Problem Statement', val: project.solution.problemStatement },
                        { label: 'Root Cause', val: project.solution.rootCause },
                        { label: 'Proposed Solution', val: project.solution.proposedSolution },
                        { label: 'Technical Approach', val: project.solution.technicalApproach },
                        { label: 'Expected Impact', val: project.solution.expectedImpact },
                        { label: 'Implementation Plan', val: project.solution.implementationPlan },
                        { label: 'Timeline', val: project.solution.timeline },
                        { label: 'Required Resources', val: project.solution.requiredResources },
                        { label: 'Sustainability Plan', val: project.solution.sustainabilityPlan },
                      ].filter((f) => f.val).map(({ label, val }) => (
                        <div key={label} className="border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                          <p className="text-xs text-slate-400 mb-1">{label}</p>
                          <p className="text-sm text-slate-700">{val}</p>
                        </div>
                      ))}
                      {project.solution.estimatedCost && (
                        <div>
                          <p className="text-xs text-slate-400">Estimated Cost</p>
                          <p className="text-sm font-bold text-slate-900">₹{project.solution.estimatedCost.toLocaleString('en-IN')}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Attached Documents & Files */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Solution Documents & Technical Blueprints</h4>
                      <p className="text-xs text-slate-500">Attach and review research papers, CAD designs, cost analyses, or code specs</p>
                    </div>
                    {project.documents?.length > 0 && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                        {project.documents.length} files
                      </span>
                    )}
                  </div>

                  {project.documents?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {project.documents.map((doc: any) => (
                        <a
                          key={doc.id}
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-white transition-all group"
                        >
                          <div className="w-10 h-10 rounded bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600">
                              {doc.title || doc.fileName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {doc.documentType || 'prototype'} · {doc.uploadedBy?.name || 'Faculty'}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No solution documents attached yet.</p>
                  )}

                  <div className="pt-3 border-t border-slate-100">
                    <FileUpload
                      label="Upload New Technical Document or Blueprint"
                      hint="Upload technical reports, schematics, or prototype files (up to 15MB)"
                      onFilesChange={handleDocumentUpload}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="card p-6">
                {!project.validation ? (
                  <p className="text-center text-slate-400 text-sm py-6">No government feedback yet.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={project.validation.status} />
                      <span className="text-sm text-slate-500">by {project.validation.govOfficer?.name}</span>
                    </div>
                    {project.validation.feedback && (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                        <p className="text-sm text-amber-800">{project.validation.feedback}</p>
                      </div>
                    )}
                    {project.validation.decidedAt && (
                      <p className="text-xs text-slate-400">
                        Decision on {format(new Date(project.validation.decidedAt), 'dd MMM yyyy')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4">Workflow</h3>
              <WorkflowTimeline currentStatus={project.problem?.status} />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
