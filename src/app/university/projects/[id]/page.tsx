'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import {
  CheckCircle, Clock, Plus, Loader2, ChevronLeft, Users, FlaskConical,
  FileText, Target, Layers, Sparkles, ArrowRight,
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { FileUpload, UploadedFile } from '@/components/ui/FileUpload'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'tasks' | 'milestones' | 'solution'>('overview')

  // Modals & form state
  const [showAssignFacultyModal, setShowAssignFacultyModal] = useState(false)
  const [facultyList, setFacultyList] = useState<any[]>([])
  const [selectedFacultyId, setSelectedFacultyId] = useState('')
  const [loadingFaculty, setLoadingFaculty] = useState(false)

  const [showTeamModal, setShowTeamModal] = useState(false)
  const [candidatesList, setCandidatesList] = useState<any[]>([])
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [teamForm, setTeamForm] = useState({
    teamName: '',
    teamDescription: '',
    userId: '',
    role: 'Student Researcher',
    discipline: 'Computer Science & IoT',
    department: '',
    responsibilities: '',
  })

  const [showSolutionModal, setShowSolutionModal] = useState(false)
  const [solutionForm, setSolutionForm] = useState({
    proposedSolution: '',
    problemStatement: '',
    rootCause: '',
    technicalApproach: '',
    expectedImpact: '',
    estimatedCost: '',
    timeline: '6 weeks',
    requiredResources: '',
    implementationPlan: '',
    sustainabilityPlan: '',
    prototypeUrl: '',
    alternativesConsidered: '',
  })

  const fetchProject = async () => {
    const r = await fetch(`/api/projects/${id}`)
    const d = await r.json()
    setProject(d)
  }

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((d) => { setProject(d); setLoading(false) })
  }, [id])

  const openAssignFacultyModal = async () => {
    setShowAssignFacultyModal(true)
    setLoadingFaculty(true)
    try {
      const r = await fetch('/api/faculty')
      const d = await r.json()
      setFacultyList(Array.isArray(d) ? d : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingFaculty(false)
    }
  }

  const handleAssignFaculty = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFacultyId) return
    setSubmitting(true)
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ASSIGN_FACULTY', facultyId: selectedFacultyId }),
      })
      setShowAssignFacultyModal(false)
      await fetchProject()
    } finally {
      setSubmitting(false)
    }
  }

  const openTeamModal = async () => {
    setShowTeamModal(true)
    setLoadingCandidates(true)
    setTeamForm({
      teamName: project?.team?.name || `${project?.title?.split(' ')[0]} Research Team`,
      teamDescription: project?.team?.description || 'Multidisciplinary student innovation team',
      userId: '',
      role: 'Student Researcher',
      discipline: 'Computer Science & IoT',
      department: '',
      responsibilities: '',
    })
    try {
      const r = await fetch('/api/team-candidates')
      const d = await r.json()
      setCandidatesList(Array.isArray(d) ? d : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingCandidates(false)
    }
  }

  const handleSaveTeamOrMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (teamForm.userId) {
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
      } else {
        await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'CREATE_TEAM',
            teamName: teamForm.teamName,
            teamDescription: teamForm.teamDescription,
          }),
        })
      }
      setShowTeamModal(false)
      await fetchProject()
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the team?')) return
    setSubmitting(true)
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REMOVE_TEAM_MEMBER', memberId }),
      })
      await fetchProject()
    } finally {
      setSubmitting(false)
    }
  }

  const openSolutionModal = () => {
    setSolutionForm({
      proposedSolution: project?.solution?.proposedSolution || '',
      problemStatement: project?.solution?.problemStatement || project?.problem?.title || '',
      rootCause: project?.solution?.rootCause || '',
      technicalApproach: project?.solution?.technicalApproach || '',
      expectedImpact: project?.solution?.expectedImpact || '',
      estimatedCost: project?.solution?.estimatedCost ? String(project.solution.estimatedCost) : '',
      timeline: project?.solution?.timeline || '6 weeks',
      requiredResources: project?.solution?.requiredResources || '',
      implementationPlan: project?.solution?.implementationPlan || '',
      sustainabilityPlan: project?.solution?.sustainabilityPlan || '',
      prototypeUrl: project?.solution?.prototypeUrl || '',
      alternativesConsidered: project?.solution?.alternativesConsidered || '',
    })
    setShowSolutionModal(true)
  }

  const handleSaveSolution = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_SOLUTION_PROPOSAL', ...solutionForm }),
      })
      setShowSolutionModal(false)
      await fetchProject()
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitToFaculty = async () => {
    setSubmitting(true)
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SUBMIT_TO_FACULTY' }),
      })
      await fetchProject()
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitToGov = async () => {
    if (!confirm('Submit this solution proposal to the Government for official evaluation?')) return
    setSubmitting(true)
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SUBMIT_SOLUTION' }),
      })
      await fetchProject()
    } finally {
      setSubmitting(false)
    }
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
  ]

  const completedMilestones = project.milestones?.filter((m: any) => m.completedAt).length || 0
  const totalMilestones = project.milestones?.length || 0
  const completedTasks = project.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0
  const totalTasks = project.tasks?.length || 0

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        <div>
          <Link href="/university/dashboard" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
            <ChevronLeft className="w-4 h-4" />Back to dashboard
          </Link>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono text-slate-400">{project.problem?.referenceId}</span>
            <StatusBadge status={project.status} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">{project.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{project.problem?.title}</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="card p-3 text-center">
            <p className="text-xl font-bold text-slate-900">{project.team?.members?.length || 0}</p>
            <p className="text-xs text-slate-500">Team Members</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-xl font-bold text-indigo-700">{completedMilestones}/{totalMilestones}</p>
            <p className="text-xs text-slate-500">Milestones</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-xl font-bold text-slate-900">{completedTasks}/{totalTasks}</p>
            <p className="text-xs text-slate-500">Tasks</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-xl font-bold text-slate-900">{project.documents?.length || 0}</p>
            <p className="text-xs text-slate-500">Documents</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main content */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
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
                <div>
                  <p className="text-xs text-slate-400 mb-1">Problem</p>
                  <p className="text-sm font-medium text-slate-900">{project.problem?.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{project.problem?.location}</p>
                </div>
                {project.description && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Project Description</p>
                    <p className="text-sm text-slate-700">{project.description}</p>
                  </div>
                )}
                {project.problem?.verification && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-xs font-medium text-emerald-700 mb-1">✓ Government Verified</p>
                    <p className="text-xs text-emerald-600">{project.problem.verification.remarks}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-2 border-t border-slate-50 flex gap-2">
                  {project.status === 'ACCEPTED' && (
                    <button onClick={() => act('START_DEVELOPMENT')} disabled={submitting} className="btn-primary text-sm">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Start Solution Development
                    </button>
                  )}
                  {project.status === 'IN_PROGRESS' && project.solution?.status === 'DRAFT' && (
                    <button onClick={() => act('SUBMIT_SOLUTION')} disabled={submitting} className="btn-success text-sm">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Submit Solution to Government
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-6">
                {/* Faculty Mentor Section */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Faculty Leader & Academic Mentor</h3>
                      <p className="text-xs text-slate-500">Guides multidisciplinary research and certifies solution proposals.</p>
                    </div>
                    <button
                      onClick={openAssignFacultyModal}
                      className="btn bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 text-xs px-3 py-1.5 flex items-center gap-1.5 font-semibold"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>{project.facultyAssignment ? 'Change Faculty Leader' : 'Assign Faculty Leader'}</span>
                    </button>
                  </div>

                  {project.facultyAssignment?.faculty ? (
                    <div className="p-4 bg-violet-50/70 rounded-xl border border-violet-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          {project.facultyAssignment.faculty.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{project.facultyAssignment.faculty.name}</h4>
                          <p className="text-xs text-violet-700 font-medium">
                            {project.facultyAssignment.faculty.faculty?.designation || 'Faculty Mentor'} • {project.facultyAssignment.faculty.faculty?.department || 'Department'}
                          </p>
                          <p className="text-xs text-slate-500">{project.facultyAssignment.faculty.email}</p>
                        </div>
                      </div>
                      {project.facultyAssignment.faculty.faculty?.expertise && (
                        <div className="text-xs text-right max-w-xs">
                          <span className="text-slate-400 block text-[11px] font-semibold uppercase">Specialization</span>
                          <span className="text-slate-700 font-medium">{project.facultyAssignment.faculty.faculty.expertise}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                      <FlaskConical className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700">No Faculty Leader Assigned Yet</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">Assign a verified faculty member to guide student research and certify the technical proposal.</p>
                      <button onClick={openAssignFacultyModal} className="btn-primary text-xs mt-2">
                        Assign Faculty Leader
                      </button>
                    </div>
                  )}
                </div>

                {/* Multidisciplinary Student Team Section */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Multidisciplinary Student Team</h3>
                      <p className="text-xs text-slate-500">{project.team?.name || 'Innovation Team'} {project.team?.description ? `— ${project.team.description}` : ''}</p>
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
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{m.user?.name || 'Team Member'}</p>
                              <p className="text-xs text-indigo-600 font-medium">{m.role} • {m.discipline}</p>
                              {m.department && <p className="text-[11px] text-slate-400">{m.department}</p>}
                            </div>
                            <button
                              onClick={() => handleRemoveMember(m.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                          {m.responsibilities && (
                            <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-1">
                              {m.responsibilities}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
                      <Users className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700">No Team Formed Yet</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">Assemble a multidisciplinary student team by selecting registered candidates.</p>
                      <button onClick={openTeamModal} className="btn-primary text-xs">
                        Assemble Multidisciplinary Team
                      </button>
                    </div>
                  )}
                </div>
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
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-medium text-slate-600">{labels[status]}</p>
                          <span className="text-xs text-slate-400 bg-white rounded px-1.5 py-0.5 border">{tasks.length}</span>
                        </div>
                        <div className="space-y-2">
                          {tasks.map((t: any) => (
                            <div key={t.id} className="bg-white rounded-lg p-2.5 border border-slate-100 shadow-sm">
                              <p className="text-xs font-medium text-slate-800 leading-snug">{t.title}</p>
                              {t.assignee && <p className="text-xs text-slate-400 mt-1">{t.assignee.name}</p>}
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
                        {m.completedAt ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <span className="text-xs text-slate-500">{i+1}</span>}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${m.completedAt ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>{m.title}</p>
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
                <div className="card p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Technical Solution Proposal</h3>
                      <p className="text-xs text-slate-500">
                        Version: <strong>v{project.solution?.version || 1}</strong> • Status: <strong className="text-indigo-600">{project.solution?.status || 'DRAFT'}</strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded font-semibold text-xs border ${
                        project.solution?.facultyApproved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : project.solution?.status === 'FACULTY_REVIEW'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {project.solution?.facultyApproved
                          ? `✓ Certified by ${project.facultyAssignment?.faculty?.name || 'Faculty Mentor'}`
                          : project.solution?.status === 'FACULTY_REVIEW'
                          ? '⏳ In Faculty Review'
                          : 'Pending Faculty Sign-off'}
                      </span>

                      <button
                        onClick={openSolutionModal}
                        className="btn bg-slate-900 hover:bg-black text-white text-xs px-3 py-1.5 flex items-center gap-1 font-semibold shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{project.solution ? 'Edit Solution' : 'Draft Solution'}</span>
                      </button>

                      {project.solution && ['DRAFT', 'CHANGES_REQUESTED'].includes(project.solution.status) && project.facultyAssignment && (
                        <button
                          onClick={handleSubmitToFaculty}
                          disabled={submitting}
                          className="btn bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 text-xs px-3 py-1.5 flex items-center gap-1 font-semibold"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Submit to Faculty</span>
                        </button>
                      )}

                      {project.solution && ['DRAFT', 'FACULTY_REVIEW', 'CHANGES_REQUESTED'].includes(project.solution.status) && (
                        <button
                          onClick={handleSubmitToGov}
                          disabled={submitting}
                          className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 flex items-center gap-1 font-semibold shadow-sm"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>Submit to Government</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {project.solution?.facultyRemarks && (
                    <div className="p-4 bg-violet-50/70 border border-violet-100 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-violet-900 block flex items-center gap-1">
                        <FlaskConical className="w-3.5 h-3.5 text-violet-600" />
                        Faculty Mentor Certification Remarks:
                      </span>
                      <p className="text-violet-800 italic">"{project.solution.facultyRemarks}"</p>
                      {project.solution.facultyApprovedAt && (
                        <span className="text-[11px] text-violet-500 block">
                          Certified on {format(new Date(project.solution.facultyApprovedAt), 'dd MMM yyyy, hh:mm a')}
                        </span>
                      )}
                    </div>
                  )}

                  {!project.solution ? (
                    <div className="p-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-700">No Solution Proposal Drafted Yet</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Author an engineering solution proposal with root cause analysis, technical approach, budget, timeline, and sustainability plan.
                      </p>
                      <button onClick={openSolutionModal} className="btn-primary text-xs">
                        Draft Solution Proposal
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
                          <span className="font-bold text-slate-900 block">Estimated Cost:</span>
                          <p className="text-indigo-700 font-bold text-sm">
                            {project.solution.estimatedCost ? `₹${project.solution.estimatedCost.toLocaleString('en-IN')}` : 'Not estimated'}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                          <span className="font-bold text-slate-900 block">Timeline:</span>
                          <p className="text-slate-700 font-medium">{project.solution.timeline || '6-8 weeks'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                          <span className="font-bold text-slate-900 block">Prototype / Blueprint URL:</span>
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
                          <span className="font-bold text-slate-900 block">Phased Implementation Plan:</span>
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
                      <h4 className="text-sm font-semibold text-slate-900">Project Documents & Solution Blueprints</h4>
                      <p className="text-xs text-slate-500">Research reports, CAD models, cost estimates, and prototype documentation</p>
                    </div>
                    {project.documents?.length > 0 && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                        {project.documents.length} files
                      </span>
                    )}
                  </div>

                  {project.documents?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {project.documents.map((doc: any) => {
                        const isImg = doc.fileType?.startsWith('image/') || doc.fileUrl?.match(/\.(jpeg|jpg|png|webp|gif)$/i)
                        return (
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
                                {doc.documentType || 'attachment'} · {doc.uploadedBy?.name || 'Team member'}
                              </p>
                            </div>
                          </a>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No solution documents attached yet.</p>
                  )}

                  <div className="pt-3 border-t border-slate-100">
                    <FileUpload
                      label="Upload New Document or Solution Blueprint"
                      hint="Upload CAD designs, PDF reports, code archives, or cost spreadsheets (up to 15MB)"
                      onFilesChange={handleDocumentUpload}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4">Workflow</h3>
              <WorkflowTimeline currentStatus={project.problem?.status} />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Assign Faculty Leader */}
      {showAssignFacultyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Assign Faculty Mentor</h3>
                <p className="text-xs text-slate-500">Designate an academic research lead to guide this civic project.</p>
              </div>
              <button onClick={() => setShowAssignFacultyModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {loadingFaculty ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading verified faculty directory...</div>
            ) : facultyList.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">No registered faculty members found.</div>
            ) : (
              <form onSubmit={handleAssignFaculty} className="space-y-4 text-xs">
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {facultyList.map((f: any) => (
                    <label
                      key={f.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedFacultyId === f.id
                          ? 'border-violet-600 bg-violet-50/70 ring-1 ring-violet-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="facultySelect"
                        value={f.id}
                        checked={selectedFacultyId === f.id}
                        onChange={() => setSelectedFacultyId(f.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm">{f.name}</p>
                        <p className="text-violet-700 font-medium text-xs">
                          {f.faculty?.designation || 'Faculty Mentor'} • {f.faculty?.department || 'Department'}
                        </p>
                        <p className="text-slate-500 text-[11px] truncate">{f.faculty?.university || f.email}</p>
                        {f.faculty?.expertise && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">Expertise: {f.faculty.expertise}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowAssignFacultyModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFacultyId || submitting}
                    className="btn bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {submitting ? 'Assigning...' : 'Assign Faculty Leader'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Assemble Team / Select Students & Add Members */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Multidisciplinary Team & Student Selection</h3>
                <p className="text-xs text-slate-500">Form a team or add student researchers across disciplines.</p>
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
                      placeholder="e.g. Project AquaGuard Multidisciplinary Team"
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
                <p className="text-xs text-slate-500">Author, draft, or refine the multidisciplinary civic solution.</p>
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
                  {project.facultyAssignment && (
                    <button
                      type="button"
                      onClick={async (e) => {
                        await handleSaveSolution(e)
                        await handleSubmitToFaculty()
                      }}
                      disabled={submitting}
                      className="btn bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      Save & Submit to Faculty
                    </button>
                  )}
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
    </DashboardShell>
  )
}
