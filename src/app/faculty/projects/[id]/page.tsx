'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import {
  CheckCircle,
  Clock,
  ChevronLeft,
  Loader2,
  AlertCircle,
  FileText,
  Users,
  Sparkles,
  Award,
  Send,
  Edit3,
  FlaskConical,
  X,
  ExternalLink,
} from 'lucide-react'
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

  // Modals state
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showSolutionModal, setShowSolutionModal] = useState(false)
  const [showSignOffModal, setShowSignOffModal] = useState(false)

  // Team candidates
  const [candidatesList, setCandidatesList] = useState<any[]>([])
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [teamForm, setTeamForm] = useState({
    teamName: '',
    teamDescription: '',
    userId: '',
    role: 'Student Researcher',
    discipline: 'Computer Science',
    department: '',
    responsibilities: '',
  })

  // Solution Form
  const [solutionForm, setSolutionForm] = useState({
    proposedSolution: '',
    rootCause: '',
    technicalApproach: '',
    estimatedCost: '',
    timeline: '',
    expectedImpact: '',
    implementationPlan: '',
    sustainabilityPlan: '',
    prototypeUrl: '',
  })

  // Sign off remarks
  const [facultyRemarks, setFacultyRemarks] = useState('')

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setProject(d)
        setLoading(false)
      })
  }, [id])

  const reloadProject = async () => {
    const r = await fetch(`/api/projects/${id}`)
    const d = await r.json()
    setProject(d)
    return d
  }

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
    await reloadProject()
  }

  const act = async (action: string, extra?: any) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Action failed')
      } else {
        await reloadProject()
      }
    } catch (e: any) {
      alert(e.message || 'Error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  // Open Team Modal
  const openTeamModal = async () => {
    setShowTeamModal(true)
    setTeamForm({
      teamName: project?.team?.name || `${project?.title || 'Project'} Innovation Team`,
      teamDescription: project?.team?.description || 'Multidisciplinary Student Research Team',
      userId: '',
      role: 'Student Researcher',
      discipline: 'Engineering & Technology',
      department: '',
      responsibilities: '',
    })
    setLoadingCandidates(true)
    try {
      const res = await fetch('/api/team-candidates')
      const data = await res.json()
      setCandidatesList(data.candidates || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingCandidates(false)
    }
  }

  // Save Team or Add Member
  const handleSaveTeamOrMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (!project.team) {
        const membersPayload = teamForm.userId
          ? [{
              userId: teamForm.userId,
              role: teamForm.role,
              discipline: teamForm.discipline,
              department: teamForm.department,
              responsibilities: teamForm.responsibilities,
            }]
          : []

        await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'CREATE_TEAM',
            name: teamForm.teamName,
            description: teamForm.teamDescription,
            members: membersPayload,
          }),
        })
      } else {
        if (!teamForm.userId) {
          alert('Please select a student or candidate to add to the team.')
          setSubmitting(false)
          return
        }
        await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ADD_TEAM_MEMBER',
            userId: teamForm.userId,
            role: teamForm.role,
            discipline: teamForm.discipline,
            department: teamForm.department,
            responsibilities: teamForm.responsibilities,
          }),
        })
      }
      await reloadProject()
      setShowTeamModal(false)
      setActiveTab('team')
    } catch (err: any) {
      alert(err.message || 'Failed to update team')
    } finally {
      setSubmitting(false)
    }
  }

  // Remove member
  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the team?')) return
    setSubmitting(true)
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REMOVE_TEAM_MEMBER',
          memberId,
        }),
      })
      await reloadProject()
    } finally {
      setSubmitting(false)
    }
  }

  // Open Solution Modal
  const openSolutionModal = () => {
    if (project?.solution) {
      setSolutionForm({
        proposedSolution: project.solution.proposedSolution || '',
        rootCause: project.solution.rootCause || '',
        technicalApproach: project.solution.technicalApproach || '',
        estimatedCost: project.solution.estimatedCost ? String(project.solution.estimatedCost) : '',
        timeline: project.solution.timeline || '',
        expectedImpact: project.solution.expectedImpact || '',
        implementationPlan: project.solution.implementationPlan || '',
        sustainabilityPlan: project.solution.sustainabilityPlan || '',
        prototypeUrl: project.solution.prototypeUrl || '',
      })
    } else {
      setSolutionForm({
        proposedSolution: '',
        rootCause: '',
        technicalApproach: '',
        estimatedCost: '',
        timeline: '6 weeks',
        expectedImpact: '',
        implementationPlan: '',
        sustainabilityPlan: '',
        prototypeUrl: '',
      })
    }
    setShowSolutionModal(true)
  }

  // Save Solution Draft
  const handleSaveSolution = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SOLUTION',
          solution: {
            problemStatement: project?.problem?.description || project?.title,
            rootCause: solutionForm.rootCause,
            proposedSolution: solutionForm.proposedSolution,
            technicalApproach: solutionForm.technicalApproach,
            expectedImpact: solutionForm.expectedImpact,
            implementationPlan: solutionForm.implementationPlan,
            sustainabilityPlan: solutionForm.sustainabilityPlan,
            estimatedCost: solutionForm.estimatedCost ? parseFloat(solutionForm.estimatedCost) : null,
            timeline: solutionForm.timeline,
            prototypeUrl: solutionForm.prototypeUrl || null,
          },
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to save solution')
      }
      await reloadProject()
      setShowSolutionModal(false)
      setActiveTab('solution')
    } catch (err: any) {
      alert(err.message || 'Error saving solution')
    } finally {
      setSubmitting(false)
    }
  }

  // Faculty Sign Off
  const handleFacultySignOff = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'FACULTY_SIGN_OFF',
          remarks: facultyRemarks,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to sign off')
      }
      await reloadProject()
      setShowSignOffModal(false)
      setActiveTab('solution')
    } catch (err: any) {
      alert(err.message || 'Error signing off')
    } finally {
      setSubmitting(false)
    }
  }

  // Submit to Gov
  const handleSubmitToGov = async () => {
    if (!confirm('Submit this solution proposal to the Government Evaluation Council?')) return
    await act('SUBMIT_SOLUTION')
    setActiveTab('solution')
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="page-content">
          <div className="animate-pulse h-96 bg-slate-100 rounded-xl" />
        </div>
      </DashboardShell>
    )
  }

  if (!project || project.error) {
    return (
      <DashboardShell>
        <div className="page-content">
          <p className="text-slate-500">Project not found.</p>
        </div>
      </DashboardShell>
    )
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'team', label: 'Team & Students' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'milestones', label: 'Milestones' },
    { key: 'solution', label: 'Solution Proposal' },
    { key: 'feedback', label: 'Govt Feedback' },
  ]

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        {/* Header with Navigation & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/faculty/dashboard" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2">
              <ChevronLeft className="w-4 h-4" />Back to dashboard
            </Link>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-400">{project.problem?.referenceId}</span>
              <StatusBadge status={project.status} />
              {project.solution?.facultyApproved && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800 flex items-center gap-1">
                  <Award className="w-3 h-3" /> Faculty Certified
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900">{project.title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">Faculty Research Leader & Academic Advisor Workspace</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openTeamModal}
              className="btn bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs px-3 py-2 flex items-center gap-1.5 shadow-sm font-semibold"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>{project.team ? 'Select Students / Team' : 'Assemble Team'}</span>
            </button>
            <button
              onClick={openSolutionModal}
              className="btn bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs px-3 py-2 flex items-center gap-1.5 font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Suggest / Edit Solution</span>
            </button>
            {project.solution && !project.solution.facultyApproved && (
              <button
                onClick={() => {
                  setFacultyRemarks('')
                  setShowSignOffModal(true)
                }}
                className="btn bg-violet-600 hover:bg-violet-700 text-white text-xs px-3 py-2 flex items-center gap-1.5 font-semibold shadow-sm"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Certify Proposal</span>
              </button>
            )}
            {project.solution && project.status !== 'SOLUTION_SUBMITTED' && project.status !== 'UNDER_VALIDATION' && (
              <button
                onClick={handleSubmitToGov}
                disabled={submitting}
                className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-2 flex items-center gap-1.5 font-semibold shadow-sm"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Submit to Govt</span>
              </button>
            )}
          </div>
        </div>

        {/* Changes Requested Banner */}
        {project.status === 'CHANGES_REQUESTED' && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Government has requested changes</p>
              {project.validation?.feedback && (
                <p className="text-sm text-amber-700 mt-1">{project.validation.feedback}</p>
              )}
              <div className="mt-3 flex gap-2">
                <button onClick={openSolutionModal} className="btn bg-amber-600 hover:bg-amber-700 text-white text-xs">
                  Revise Solution
                </button>
                <button onClick={() => act('SUBMIT_SOLUTION')} disabled={submitting} className="btn-primary text-xs">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Resubmit to Government
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit flex-wrap">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="card p-6 space-y-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Problem Description</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{project.problem?.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-50 grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-slate-500">Location</span>
                  <span className="font-medium text-slate-900">{project.problem?.location}</span>
                  {project.problem?.affectedPopulation && (
                    <>
                      <span className="text-slate-500">Affected Population</span>
                      <span className="font-medium text-slate-900">~{project.problem.affectedPopulation.toLocaleString()} citizens</span>
                    </>
                  )}
                  <span className="text-slate-500">Department</span>
                  <span className="font-medium text-slate-900">{project.problem?.department || 'Civic Infrastructure'}</span>
                </div>
                {project.problem?.verification?.status === 'VERIFIED' && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-xs font-medium text-emerald-700 mb-1">✓ Government Verified Civic Need</p>
                    <p className="text-xs text-emerald-600">{project.problem.verification.remarks}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                  <button onClick={openSolutionModal} className="btn-primary text-xs">
                    {project.solution ? 'Edit Solution' : 'Draft Solution'}
                  </button>
                  <button onClick={openTeamModal} className="btn-secondary text-xs">
                    Manage Team & Students
                  </button>
                  <Link href={`/problems/${project.problem?.id}`} className="btn-secondary text-xs flex items-center gap-1">
                    <span>View Case Room</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* TEAM TAB */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                {/* Faculty Card */}
                <div className="card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Faculty Research Leader</h3>
                      <p className="text-xs text-slate-500">You are leading this project's multidisciplinary research and technical sign-off.</p>
                    </div>
                    <span className="px-2.5 py-1 bg-violet-100 text-violet-800 rounded-full text-xs font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Assigned Mentor
                    </span>
                  </div>

                  {project.facultyAssignment?.faculty ? (
                    <div className="flex items-center gap-3 p-3.5 bg-violet-50/70 rounded-xl border border-violet-100">
                      <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm">
                        {project.facultyAssignment.faculty.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">{project.facultyAssignment.faculty.name}</p>
                        <p className="text-xs text-violet-700 font-medium">
                          {project.facultyAssignment.faculty?.faculty?.designation || 'Faculty Member'} · {project.facultyAssignment.faculty?.faculty?.department || 'Department'}
                        </p>
                        <p className="text-xs text-slate-500">{project.facultyAssignment.faculty.email}</p>
                      </div>
                      {project.facultyAssignment.faculty?.faculty?.expertise && (
                        <div className="text-right text-xs max-w-xs">
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Expertise</span>
                          <span className="text-slate-700 font-medium">{project.facultyAssignment.faculty.faculty.expertise}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                      Direct faculty leadership assigned.
                    </div>
                  )}
                </div>

                {/* Multidisciplinary Team & Student Members */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Multidisciplinary Student Team</h3>
                      <p className="text-xs text-slate-500">
                        {project.team?.name || 'Innovation Team'} {project.team?.description ? `— ${project.team.description}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={openTeamModal}
                      className="btn bg-slate-900 hover:bg-black text-white text-xs px-3 py-1.5 flex items-center gap-1.5 font-semibold shadow-sm"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{project.team ? 'Select Students / Add Member' : 'Assemble Team'}</span>
                    </button>
                  </div>

                  {project.team?.members && project.team.members.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {project.team.members.map((m: any) => (
                        <div key={m.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 relative group hover:border-indigo-200 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                {m.user?.name?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{m.user?.name}</span>
                                <span className="text-indigo-600 font-medium block text-[11px]">{m.role}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveMember(m.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove Member"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="pt-1 text-[11px] text-slate-600">
                            <span className="font-semibold text-slate-700">Discipline:</span> {m.discipline} {m.department ? `(${m.department})` : ''}
                          </div>
                          {m.responsibilities && (
                            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-1">
                              <span className="font-medium text-slate-600">Task:</span> {m.responsibilities}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                      <Users className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700">No Student Researchers Added Yet</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Assemble your multidisciplinary student squad by picking registered candidates from engineering, computer science, and public policy.
                      </p>
                      <button onClick={openTeamModal} className="btn-primary text-xs mt-2">
                        Select Students & Assemble Team
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TASKS TAB */}
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
                            <div key={t.id} className="bg-white rounded-lg p-2 border text-xs text-slate-700 shadow-2xs">
                              <p className="font-medium">{t.title}</p>
                              {t.assignee && <p className="text-[10px] text-slate-400 mt-1">👤 {t.assignee.name}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* MILESTONES TAB */}
            {activeTab === 'milestones' && (
              <div className="card p-6">
                <div className="space-y-3">
                  {(project.milestones || []).map((m: any, i: number) => (
                    <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.completedAt ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        {m.completedAt ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <span className="text-xs text-slate-500">{i + 1}</span>}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${m.completedAt ? 'font-medium text-slate-700' : 'text-slate-500'}`}>{m.title}</p>
                        {m.description && <p className="text-xs text-slate-400">{m.description}</p>}
                      </div>
                      {m.completedAt ? (
                        <span className="text-xs text-emerald-600 font-medium">{format(new Date(m.completedAt), 'dd MMM')}</span>
                      ) : m.dueDate ? (
                        <span className="text-xs text-slate-400">Due {format(new Date(m.dueDate), 'dd MMM')}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SOLUTION TAB */}
            {activeTab === 'solution' && (
              <div className="space-y-6">
                {/* Faculty Endorsement Status */}
                {project.solution?.facultyApproved ? (
                  <div className="p-4 bg-violet-50 rounded-xl border border-violet-200 flex items-start gap-3">
                    <Award className="w-5 h-5 text-violet-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-violet-900">Faculty Certified Solution Proposal</h4>
                      <p className="text-xs text-violet-700 mt-0.5">
                        Certified by {project.facultyAssignment?.faculty?.name || 'Faculty Leader'}.
                        {project.solution.facultyRemarks && (
                          <span className="block mt-1 font-normal text-violet-800 italic bg-white/60 p-2 rounded-lg border border-violet-100">
                            "{project.solution.facultyRemarks}"
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ) : project.solution ? (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <FlaskConical className="w-5 h-5 text-amber-700 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-900">Pending Faculty Certification</h4>
                        <p className="text-xs text-amber-700">Review the student proposal below and provide your academic certification before government review.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFacultyRemarks('')
                        setShowSignOffModal(true)
                      }}
                      className="btn bg-violet-600 hover:bg-violet-700 text-white text-xs px-3 py-1.5 font-semibold flex-shrink-0"
                    >
                      Certify Proposal
                    </button>
                  </div>
                ) : null}

                {/* Solution Content Card */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Technical Solution Proposal</h3>
                      <p className="text-xs text-slate-500">Rigorous multidisciplinary proposal formulated for municipal evaluation.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={openSolutionModal}
                        className="btn bg-slate-900 hover:bg-black text-white text-xs px-3 py-1.5 flex items-center gap-1.5 font-semibold shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{project.solution ? 'Edit Proposal' : 'Draft Proposal'}</span>
                      </button>
                      {project.solution && project.status !== 'SOLUTION_SUBMITTED' && (
                        <button
                          onClick={handleSubmitToGov}
                          disabled={submitting}
                          className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 flex items-center gap-1.5 font-semibold shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit to Govt</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {!project.solution ? (
                    <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
                      <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700">No Solution Drafted Yet</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Suggest or author a solution proposal encompassing root cause analysis, technical approach, budget, and implementation roadmap.
                      </p>
                      <button onClick={openSolutionModal} className="btn-primary text-xs">
                        Suggest / Draft Solution
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-xs">
                      <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                        <span className="font-bold text-slate-900 block">Proposed Engineering Intervention:</span>
                        <p className="text-slate-800 text-sm font-medium leading-relaxed">{project.solution.proposedSolution}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                          <span className="font-bold text-slate-900 block">Root Cause Analysis:</span>
                          <p className="text-slate-600 leading-relaxed">{project.solution.rootCause}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                          <span className="font-bold text-slate-900 block">Technical Approach & Methodology:</span>
                          <p className="text-slate-600 leading-relaxed">{project.solution.technicalApproach}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                          <span className="font-bold text-slate-900 block">Estimated Budget:</span>
                          <p className="text-indigo-700 font-bold text-sm">
                            {project.solution.estimatedCost ? `₹${project.solution.estimatedCost.toLocaleString('en-IN')}` : 'Not estimated'}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                          <span className="font-bold text-slate-900 block">Deployment Timeline:</span>
                          <p className="text-slate-700 font-medium">{project.solution.timeline || '6-8 weeks'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                          <span className="font-bold text-slate-900 block">Prototype / CAD URL:</span>
                          {project.solution.prototypeUrl ? (
                            <a href={project.solution.prototypeUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium truncate block">
                              {project.solution.prototypeUrl}
                            </a>
                          ) : (
                            <span className="text-slate-400">None attached</span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                        <span className="font-bold text-slate-900 block">Expected Community Impact:</span>
                        <p className="text-slate-700 leading-relaxed">{project.solution.expectedImpact}</p>
                      </div>

                      {project.solution.implementationPlan && (
                        <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                          <span className="font-bold text-slate-900 block">Phased Pilot Implementation:</span>
                          <p className="text-slate-600 leading-relaxed">{project.solution.implementationPlan}</p>
                        </div>
                      )}

                      {project.solution.sustainabilityPlan && (
                        <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                          <span className="font-bold text-slate-900 block">Sustainability & Handover:</span>
                          <p className="text-slate-600 leading-relaxed">{project.solution.sustainabilityPlan}</p>
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

            {/* GOVT FEEDBACK TAB */}
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

          {/* Workflow Sidebar */}
          <div className="col-span-12 lg:col-span-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4">Workflow</h3>
              <WorkflowTimeline currentStatus={project.problem?.status} />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Assemble Team / Select Students & Add Members */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Multidisciplinary Team & Student Selection</h3>
                <p className="text-xs text-slate-500">Select registered students across disciplines to assign to this research project.</p>
              </div>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveTeamOrMember} className="space-y-3 text-xs">
              {!project.team && (
                <>
                  <div>
                    <label className="label">Team Name</label>
                    <input
                      type="text"
                      className="input"
                      value={teamForm.teamName}
                      onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                      placeholder="e.g. Project Innovation Squad"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Team Mission / Description</label>
                    <input
                      type="text"
                      className="input"
                      value={teamForm.teamDescription}
                      onChange={(e) => setTeamForm({ ...teamForm, teamDescription: e.target.value })}
                      placeholder="e.g. Combining Civil Engineering, IoT Sensors, and Software"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 border-t border-slate-100">
                <label className="label font-bold text-slate-800">Select Registered Student / Candidate</label>
                {loadingCandidates ? (
                  <div className="text-slate-400 text-xs py-2">Loading candidates...</div>
                ) : (
                  <select
                    className="select"
                    value={teamForm.userId}
                    onChange={(e) => setTeamForm({ ...teamForm, userId: e.target.value })}
                  >
                    <option value="">-- Choose Candidate from Platform Directory --</option>
                    {candidatesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email}) — {c.role} {c.faculty?.department ? `• ${c.faculty.department}` : ''}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Select a student or platform member to assign responsibilities.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Role</label>
                  <select
                    className="select"
                    value={teamForm.role}
                    onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                  >
                    <option value="Student Team Lead">Student Team Lead</option>
                    <option value="Student Researcher">Student Researcher</option>
                    <option value="Hardware / IoT Engineer">Hardware / IoT Engineer</option>
                    <option value="Software Developer">Software Developer</option>
                    <option value="Field Surveyor">Field Surveyor</option>
                    <option value="Hydraulics Specialist">Hydraulics Specialist</option>
                    <option value="Environmental Analyst">Environmental Analyst</option>
                  </select>
                </div>
                <div>
                  <label className="label">Discipline / Branch</label>
                  <input
                    type="text"
                    className="input"
                    value={teamForm.discipline}
                    onChange={(e) => setTeamForm({ ...teamForm, discipline: e.target.value })}
                    placeholder="e.g. Computer Science & IoT, Civil Engg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Department / College (Optional)</label>
                <input
                  type="text"
                  className="input"
                  value={teamForm.department}
                  onChange={(e) => setTeamForm({ ...teamForm, department: e.target.value })}
                  placeholder="e.g. Dept of Computer Science"
                />
              </div>

              <div>
                <label className="label">Specific Deliverables / Responsibilities</label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={teamForm.responsibilities}
                  onChange={(e) => setTeamForm({ ...teamForm, responsibilities: e.target.value })}
                  placeholder="e.g. Ultrasonic sensor firmware and cloud data transmission"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowTeamModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : teamForm.userId ? 'Add Member to Team' : 'Assemble Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Technical Solution Proposal Editor */}
      {showSolutionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Technical Solution Proposal</h3>
                <p className="text-xs text-slate-500">Author, draft, or refine the multidisciplinary civic solution proposal.</p>
              </div>
              <button onClick={() => setShowSolutionModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveSolution} className="space-y-4 text-xs">
              <div>
                <label className="label font-bold">Proposed Engineering Intervention (Title & Summary)</label>
                <input
                  type="text"
                  className="input font-semibold"
                  value={solutionForm.proposedSolution}
                  onChange={(e) => setSolutionForm({ ...solutionForm, proposedSolution: e.target.value })}
                  placeholder="e.g. Automated Silt Trap with Real-Time LoRaWAN Water Level Sensor"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Root Cause Analysis</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    value={solutionForm.rootCause}
                    onChange={(e) => setSolutionForm({ ...solutionForm, rootCause: e.target.value })}
                    placeholder="Underlying technical cause of the civic issue..."
                    required
                  />
                </div>
                <div>
                  <label className="label">Technical Approach & Methodology</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    value={solutionForm.technicalApproach}
                    onChange={(e) => setSolutionForm({ ...solutionForm, technicalApproach: e.target.value })}
                    placeholder="Hardware, software, structural calculations, IoT stack..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="label">Estimated Budget (₹ INR)</label>
                  <input
                    type="number"
                    className="input"
                    value={solutionForm.estimatedCost}
                    onChange={(e) => setSolutionForm({ ...solutionForm, estimatedCost: e.target.value })}
                    placeholder="e.g. 75000"
                    required
                  />
                </div>
                <div>
                  <label className="label">Timeline</label>
                  <input
                    type="text"
                    className="input"
                    value={solutionForm.timeline}
                    onChange={(e) => setSolutionForm({ ...solutionForm, timeline: e.target.value })}
                    placeholder="e.g. 6 weeks"
                    required
                  />
                </div>
                <div>
                  <label className="label">Prototype / Blueprint URL</label>
                  <input
                    type="url"
                    className="input"
                    value={solutionForm.prototypeUrl}
                    onChange={(e) => setSolutionForm({ ...solutionForm, prototypeUrl: e.target.value })}
                    placeholder="https://github.com/... or Figma/Drive"
                  />
                </div>
              </div>

              <div>
                <label className="label">Expected Quantifiable Community Impact</label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={solutionForm.expectedImpact}
                  onChange={(e) => setSolutionForm({ ...solutionForm, expectedImpact: e.target.value })}
                  placeholder="e.g. Prevents school campus flooding, safeguarding 1,200 students during heavy monsoon."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Phased Pilot Implementation Plan</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    value={solutionForm.implementationPlan}
                    onChange={(e) => setSolutionForm({ ...solutionForm, implementationPlan: e.target.value })}
                    placeholder="Phase 1: Sensor fabrication; Phase 2: On-site culvert fitting..."
                    required
                  />
                </div>
                <div>
                  <label className="label">Long-Term Maintenance & Sustainability</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    value={solutionForm.sustainabilityPlan}
                    onChange={(e) => setSolutionForm({ ...solutionForm, sustainabilityPlan: e.target.value })}
                    placeholder="Handover protocol to municipal engineering division..."
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowSolutionModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button type="submit" disabled={submitting} className="btn bg-slate-800 hover:bg-slate-900 text-white">
                    {submitting ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={async (e) => {
                      await handleSaveSolution(e)
                      setShowSignOffModal(true)
                    }}
                    disabled={submitting}
                    className="btn bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    Save & Certify Proposal
                  </button>
                  <button
                    type="button"
                    onClick={async (e) => {
                      await handleSaveSolution(e)
                      await handleSubmitToGov()
                    }}
                    disabled={submitting}
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    Save & Submit to Govt
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Faculty Certification Sign-Off */}
      {showSignOffModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Faculty Leader Certification</h3>
                <p className="text-xs text-slate-500">Certify this technical proposal before government validation.</p>
              </div>
              <button onClick={() => setShowSignOffModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleFacultySignOff} className="space-y-4 text-xs">
              <div>
                <label className="label">Endorsement Remarks & Recommendations</label>
                <textarea
                  className="textarea"
                  rows={4}
                  value={facultyRemarks}
                  onChange={(e) => setFacultyRemarks(e.target.value)}
                  placeholder="e.g. Solution methodology and cost calculations reviewed. The IoT sensor specs and hydraulic design meet municipal requirements."
                  required
                />
              </div>

              <div className="p-3 bg-violet-50 rounded-lg text-violet-800 text-[11px] leading-relaxed">
                ✓ By certifying, you confirm this proposal is technically viable, safe, and ready for official government rubric scoring.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowSignOffModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn bg-violet-600 hover:bg-violet-700 text-white">
                  {submitting ? 'Certifying...' : 'Certify Solution Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
