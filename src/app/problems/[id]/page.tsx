'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import { StatusBadge } from '@/components/workflow/StatusBadge'
import { CommunityConfirmButton } from '@/components/workflow/CommunityConfirmButton'
import {
  MapPin, Users, Calendar, FileText, CheckCircle, Clock,
  Building2, GraduationCap, FlaskConical, Factory, ChevronRight,
  AlertCircle, TrendingUp, Shield, Sparkles, Plus, CheckSquare,
  Award, ArrowRight, CornerDownRight, ThumbsUp, HelpCircle,
  ClipboardCheck, Sliders, ShieldCheck, Target, Layers, Play, Flame
} from 'lucide-react'
import { format } from 'date-fns'

export default function ProblemCaseRoomPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [problem, setProblem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [actionLoading, setActionLoading] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState('')

  // Form modals / state for actions
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verifyForm, setVerifyForm] = useState({
    action: 'VERIFY',
    remarks: '',
    municipalityInput: '',
    siteVisited: true,
    evidenceReviewed: true,
    populationValidated: true,
    localBodyConsulted: true,
    concurrenceOfficial: 'Sh. Rajesh Verma (SDM)',
    concurrenceDesignation: 'Sub-Divisional Magistrate',
    concurrenceNotes: 'Joint inspection confirmed blockage and safety risk.',
    recommendedDept: 'Water Supply & Sewerage Board',
    priorityScore: '85',
    slaDays: '21',
  })

  const [showRubricModal, setShowRubricModal] = useState(false)
  const [rubricForm, setRubricForm] = useState({
    action: 'APPROVE',
    feasibilityScore: 4,
    safetyScore: 5,
    costReasonableScore: 4,
    publicBenefitScore: 5,
    scalabilityScore: 4,
    sustainabilityScore: 4,
    feedback: 'Technical approach is sound with minimal civic disruption.',
  })

  const [showTaskModal, setShowTaskModal] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM')

  const [showPledgeModal, setShowPledgeModal] = useState(false)
  const [pledgeForm, setPledgeForm] = useState({
    collaborationType: 'FUNDING',
    amount: '150000',
    description: 'CSR grant for equipment procurement and testing',
  })

  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [resolutionStatus, setResolutionStatus] = useState('CONFIRMED_IMPROVED')
  const [resolutionComment, setResolutionComment] = useState('')

  const fetchProblem = () => {
    fetch(`/api/problems/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setProblem(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchProblem()
  }, [id])

  if (loading) {
    return (
      <DashboardShell>
        <div className="page-content space-y-4 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="h-48 bg-slate-100 rounded-xl" />
          <div className="h-96 bg-slate-100 rounded-xl" />
        </div>
      </DashboardShell>
    )
  }

  if (!problem || problem.error) {
    return (
      <DashboardShell>
        <div className="page-content">
          <div className="card p-12 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">Case Room Not Found</h3>
            <p className="text-sm text-slate-500 mt-1">This problem record does not exist or has been removed.</p>
            <Link href="/citizen/problems" className="btn-primary mt-4 inline-flex items-center gap-2">
              Back to Problems
            </Link>
          </div>
        </div>
      </DashboardShell>
    )
  }

  const role = session?.user?.role || 'CITIZEN'
  const project = problem.project
  const team = project?.team
  const solution = project?.solution
  const verification = problem.verification
  const auditLogs = problem.auditLogs || []
  const collaborations = project?.collaborations || []
  const checkpoints = project?.checkpoints || []
  const tasks = project?.tasks || []
  const milestones = project?.milestones || []

  // 8 Lifecycle Stages
  const stages = [
    { key: 'SUBMITTED', label: 'Reported', desc: 'Citizen filed problem' },
    { key: 'VERIFIED', label: 'Verified', desc: 'Government verified' },
    { key: 'ACCEPTED', label: 'Uni Match', desc: 'University accepted' },
    { key: 'TEAM_FORMATION', label: 'Team & Research', desc: 'Team assembled' },
    { key: 'SOLUTION_SUBMITTED', label: 'Solution Review', desc: 'Proposal in review' },
    { key: 'APPROVED', label: 'Industry Support', desc: 'Govt approved & funded' },
    { key: 'IMPLEMENTATION', label: 'Pilot', desc: 'Deployment on site' },
    { key: 'PROBLEM_SOLVED', label: 'Impact', desc: 'Civic impact sustained' },
  ]

  const getStageIndex = (status: string) => {
    if (['SUBMITTED', 'UNDER_VERIFICATION', 'ADDITIONAL_INFO_REQUIRED'].includes(status)) return 0
    if (['VERIFIED', 'UNDER_UNIVERSITY_REVIEW'].includes(status)) return 1
    if (['ACCEPTED'].includes(status)) return 2
    if (['TEAM_FORMATION', 'SOLUTION_DEVELOPMENT'].includes(status)) return 3
    if (['SOLUTION_SUBMITTED', 'GOVERNMENT_VALIDATION'].includes(status)) return 4
    if (['APPROVED', 'INDUSTRY_COLLABORATION'].includes(status)) return 5
    if (['IMPLEMENTATION'].includes(status)) return 6
    if (['PROBLEM_SOLVED', 'IMPACT_MEASUREMENT', 'SUSTAINABLE_IMPACT'].includes(status)) return 7
    return 0
  }

  const currentStageIdx = getStageIndex(problem.status)

  // Handlers for interactive actions
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const res = await fetch(`/api/problems/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyForm),
      })
      if (res.ok) {
        setFeedbackMsg('Government verification completed successfully.')
        setShowVerifyModal(false)
        fetchProblem()
      } else {
        const d = await res.json()
        alert(d.error || 'Verification failed')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAcceptChallenge = async () => {
    if (!project?.id) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACCEPT_CHALLENGE' }),
      })
      if (res.ok) {
        setFeedbackMsg('University successfully accepted the challenge.')
        fetchProblem()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRubricSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project?.id) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rubricForm),
      })
      if (res.ok) {
        setFeedbackMsg('Solution evaluated and scored.')
        setShowRubricModal(false)
        fetchProblem()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project?.id || !newTaskTitle.trim()) return
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_TASK',
          title: newTaskTitle.trim(),
          priority: newTaskPriority,
        }),
      })
      if (res.ok) {
        setNewTaskTitle('')
        setShowTaskModal(false)
        fetchProblem()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    if (!project?.id) return
    const nextStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED'
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_TASK', taskId, status: nextStatus }),
      })
      fetchProblem()
    } catch (err) {
      console.error(err)
    }
  }

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project?.id) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/collaborate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EXPRESS_INTEREST',
          collaborationType: pledgeForm.collaborationType,
          amount: pledgeForm.amount,
          description: pledgeForm.description,
        }),
      })
      if (res.ok) {
        setFeedbackMsg('CSR resource pledge submitted successfully.')
        setShowPledgeModal(false)
        fetchProblem()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleResolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project?.id) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RECORD_CHECKPOINT',
          checkpointDay: 30,
          status: resolutionStatus,
          feedback: resolutionComment,
        }),
      })
      if (res.ok) {
        setFeedbackMsg('Thank you! Your community resolution feedback has been recorded.')
        setShowFeedbackModal(false)
        fetchProblem()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        {/* Top Breadcrumb & Alerts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-900 font-semibold text-indigo-600">SIH 26043</Link>
            <span>/</span>
            <Link href="/citizen/problems" className="hover:text-slate-900">Problems</Link>
            <span>/</span>
            <span className="font-mono font-semibold text-slate-900">{problem.referenceId}</span>
          </div>

          <div className="flex items-center gap-2">
            {problem.isEmergency && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white shadow-sm animate-pulse">
                <Flame className="w-3.5 h-3.5" />
                TOPMOST PRIORITY
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Health: On Track
            </span>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              SLA: 14 Days Remaining
            </span>
          </div>
        </div>

        {/* Emergency Alert Banner */}
        {problem.isEmergency && (
          <div className="p-4 bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-xl shadow-md flex items-start sm:items-center justify-between gap-4 border border-rose-500">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm tracking-wide uppercase">
                    🚨 VERIFIED LIFE-SAFETY EMERGENCY INCIDENT
                  </span>
                  <span className="text-[10px] bg-white text-rose-700 px-2 py-0.5 rounded-full font-bold">
                    PRIORITY ESCALATED
                  </span>
                </div>
                <p className="text-xs text-rose-100 mt-0.5">
                  {problem.emergencyReason || 'Verified imminent danger to life or catastrophic civic disaster. Immediate municipal action protocol active.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis & Actionable Suggestions Card */}
        {(problem.aiSuggestions || problem.aiCategory || problem.aiRecommendedDepts) && (
          <div className="card p-5 border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/70 dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-100/60 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                  Auto AI Taxonomic Classification & Engineering Suggestions
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-100/80 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                Gemini Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 font-medium">AI Category & Severity</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {problem.aiCategory || problem.category}
                </p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Severity: {problem.aiSeverity || 'Standard'}
                </span>
              </div>

              {problem.aiRecommendedDepts && (
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-800 md:col-span-2">
                  <p className="text-[11px] text-slate-400 font-medium">Recommended University Disciplines & Departments</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {(() => {
                      try {
                        const depts = JSON.parse(problem.aiRecommendedDepts)
                        return Array.isArray(depts) ? depts.map((d: string) => (
                          <span key={d} className="text-[11px] bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border border-violet-100 dark:border-violet-900 rounded px-2 py-0.5 font-medium">
                            {d}
                          </span>
                        )) : null
                      } catch {
                        return <span className="text-xs text-slate-600">{problem.aiRecommendedDepts}</span>
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>

            {problem.aiSuggestions && (
              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  AI-Suggested Actionable Interventions:
                </p>
                {(() => {
                  try {
                    const steps = JSON.parse(problem.aiSuggestions)
                    if (Array.isArray(steps)) {
                      return (
                        <ul className="space-y-1">
                          {steps.map((step: string, idx: number) => (
                            <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                              <span className="text-indigo-600 font-bold">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      )
                    }
                  } catch {}
                  return <p className="text-xs text-slate-600">{problem.aiSuggestions}</p>
                })()}
              </div>
            )}
          </div>
        )}

        {feedbackMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex items-center justify-between">
            <span>{feedbackMsg}</span>
            <button onClick={() => setFeedbackMsg('')} className="text-emerald-600 hover:text-emerald-900">×</button>
          </div>
        )}

        {/* Case Header Card */}
        <div className="card p-6 border-slate-200 bg-gradient-to-r from-white via-slate-50/50 to-white shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                {problem.isEmergency && (
                  <span className="font-bold text-[11px] bg-rose-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                    <Flame className="w-3 h-3" />
                    EMERGENCY
                  </span>
                )}
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  {problem.referenceId}
                </span>
                <StatusBadge status={problem.status} />
                {problem.aiSeverity && (
                  <span className="text-xs px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-900">
                    Severity: {problem.aiSeverity}
                  </span>
                )}
                {problem.category && (
                  <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700">
                    {problem.category.replace(/_/g, ' ')}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{problem.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {problem.location}
                </span>
                {problem.municipality && <span>• {problem.municipality}</span>}
                {problem.affectedPopulation && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    ~{problem.affectedPopulation.toLocaleString()} citizens affected
                  </span>
                )}
                <span>• Reported {format(new Date(problem.createdAt), 'dd MMM yyyy')}</span>
              </div>
            </div>

            {/* Quick Action Button Bar */}
            <div className="flex flex-wrap items-center gap-2 self-start">
              {/* Citizen Community +1 Button */}
              {role === 'CITIZEN' && (
                <CommunityConfirmButton
                  problemId={problem.id}
                  initialCount={problem.confirmationCount || 0}
                  initialConfirmed={problem.hasConfirmed || false}
                />
              )}

              {/* Government Actions */}
              {['GOVERNMENT', 'ADMIN'].includes(role) && ['SUBMITTED', 'UNDER_VERIFICATION'].includes(problem.status) && (
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Perform Field Inspection</span>
                </button>
              )}

              {/* University Claim Button */}
              {['UNIVERSITY', 'FACULTY', 'ADMIN'].includes(role) && problem.status === 'VERIFIED' && (
                <button
                  onClick={handleAcceptChallenge}
                  disabled={actionLoading}
                  className="btn bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Accept Research Challenge</span>
                </button>
              )}

              {/* Government Validate Solution Button */}
              {['GOVERNMENT', 'ADMIN'].includes(role) && ['SOLUTION_SUBMITTED', 'GOVERNMENT_VALIDATION'].includes(problem.status) && (
                <button
                  onClick={() => setShowRubricModal(true)}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Score Solution Rubric</span>
                </button>
              )}

              {/* Industry Support Button */}
              {['INDUSTRY', 'ADMIN'].includes(role) && (
                <button
                  onClick={() => setShowPledgeModal(true)}
                  className="btn bg-amber-600 hover:bg-amber-700 text-white text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
                >
                  <Factory className="w-4 h-4" />
                  <span>Pledge CSR Support</span>
                </button>
              )}

              {/* Citizen Resolution Feedback */}
              {role === 'CITIZEN' && ['IMPLEMENTATION', 'PROBLEM_SOLVED'].includes(problem.status) && (
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Confirm Problem Improved</span>
                </button>
              )}
            </div>
          </div>

          {/* Stepper Progression */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-700">Full Civic Lifecycle Progression</span>
              <span>Stage {currentStageIdx + 1} of 8: <strong className="text-indigo-600">{stages[currentStageIdx].label}</strong></span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {stages.map((st, i) => {
                const isPassed = i < currentStageIdx
                const isCurrent = i === currentStageIdx

                return (
                  <div key={st.key} className="space-y-1.5">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPassed
                          ? 'bg-emerald-500'
                          : isCurrent
                          ? 'bg-indigo-600 ring-2 ring-indigo-200 animate-pulse'
                          : 'bg-slate-200'
                      }`}
                    />
                    <div className="text-[11px] leading-tight font-medium text-slate-600 truncate" title={st.label}>
                      {st.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 overflow-x-auto gap-1 text-xs font-semibold text-slate-600 pb-0.5">
          {[
            { id: 'overview', label: 'Case Brief' },
            { id: 'evidence', label: 'Evidence & Location' },
            { id: 'verification', label: 'Field Verification' },
            { id: 'challenge', label: 'University Brief' },
            { id: 'team', label: 'Team & Tasks' },
            { id: 'solution', label: 'Solution Proposal' },
            { id: 'rubric', label: 'Govt Rubric' },
            { id: 'industry', label: 'Industry Support' },
            { id: 'pilot', label: 'Pilot & Impact' },
            { id: 'audit', label: 'Audit Trail' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700 font-bold bg-indigo-50/40 rounded-t-lg'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Problem Statement</h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{problem.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block">Reported By</span>
                    <span className="font-semibold text-slate-800">{problem.citizen?.name || 'Local Resident'}</span>
                    <span className="text-slate-400 block text-[11px]">{problem.citizen?.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Municipality / Ward</span>
                    <span className="font-semibold text-slate-800">{problem.municipality || 'Chandigarh MC'}</span>
                    <span className="text-slate-400 block text-[11px]">{problem.district}, {problem.state}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Community Impact</span>
                    <span className="font-semibold text-slate-800">~{problem.affectedPopulation?.toLocaleString()} Residents</span>
                    <span className="text-slate-400 block text-[11px]">{problem.confirmationCount} confirmed affected</span>
                  </div>
                </div>
              </div>

              {/* AI Diagnostic Brief */}
              <div className="card p-6 bg-gradient-to-r from-indigo-50/50 via-white to-white border-indigo-100 space-y-3">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Gemini AI Civic Diagnosis & Triage</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-indigo-100">
                    <span className="text-slate-500 font-medium block">Recommended Department</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      {verification?.recommendedDept || 'Water Supply & Sewerage Board'}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-indigo-100">
                    <span className="text-slate-500 font-medium block">University Disciplines</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      Civil, Hydraulic & IoT Engineering
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Summary */}
            <div className="space-y-6">
              <div className="card p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Assigned Stakeholders</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                      G
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        {verification?.govOfficer?.name || 'Priya Sharma'}
                      </span>
                      <span className="text-slate-500 block">Municipal Corporation of Chandigarh</span>
                      <span className="text-[11px] text-blue-600">Verification Officer</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold flex-shrink-0">
                      U
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        {project?.facultyAssignment?.faculty?.name || 'Prof. Kavitha Reddy'}
                      </span>
                      <span className="text-slate-500 block">Punjab Engineering College</span>
                      <span className="text-[11px] text-indigo-600">Faculty Research Lead</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold flex-shrink-0">
                      I
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        {collaborations[0]?.industryPartner?.name || 'SmartCity Solutions Pvt. Ltd.'}
                      </span>
                      <span className="text-slate-500 block">Smart Infrastructure & IoT</span>
                      <span className="text-[11px] text-amber-600">CSR & Implementation Partner</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EVIDENCE & LOCATION */}
        {activeTab === 'evidence' && (
          <div className="card p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Submitted Media & Ground Evidence</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {problem.evidence && problem.evidence.length > 0 ? (
                problem.evidence.map((ev: any) => (
                  <div key={ev.id} className="border border-slate-200 rounded-xl overflow-hidden group hover:border-indigo-300 transition-all">
                    <div className="h-44 bg-slate-100 flex items-center justify-center text-slate-400 relative">
                      {ev.fileUrl.startsWith('data:image') || ev.fileUrl.endsWith('.jpg') || ev.fileUrl.endsWith('.png') ? (
                        <img src={ev.fileUrl} alt={ev.fileName} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-10 h-10 text-slate-300" />
                      )}
                    </div>
                    <div className="p-3 bg-white">
                      <p className="text-xs font-semibold text-slate-900 truncate">{ev.fileName || 'Evidence Photo'}</p>
                      <p className="text-[11px] text-slate-400">{format(new Date(ev.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No media attachments uploaded for this report.</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 mb-2">Location Geotagging</h4>
              <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="font-semibold block">{problem.location}</span>
                  <span className="text-slate-500 text-[11px]">
                    Coordinates: {problem.latitude || '30.7333'}° N, {problem.longitude || '76.7794'}° E
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold rounded-md text-[11px]">
                  GPS Verified
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VERIFICATION */}
        {activeTab === 'verification' && (
          <div className="card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Government Field Inspection & Concurrence</h3>
                <p className="text-xs text-slate-500 mt-0.5">Formal verification by designated municipal authorities.</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${verification?.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {verification?.status || 'PENDING'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">Field Inspection Checklist</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-slate-700">
                    <input type="checkbox" checked={verification?.siteVisited || true} readOnly className="rounded text-indigo-600" />
                    <span>Official physical site inspection conducted</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700">
                    <input type="checkbox" checked={verification?.evidenceReviewed || true} readOnly className="rounded text-indigo-600" />
                    <span>Citizen photographic evidence verified on ground</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700">
                    <input type="checkbox" checked={verification?.populationValidated || true} readOnly className="rounded text-indigo-600" />
                    <span>Impact radius and affected population confirmed</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700">
                    <input type="checkbox" checked={verification?.localBodyConsulted || true} readOnly className="rounded text-indigo-600" />
                    <span>Municipal Corporation / Panchayat concurred</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">Official Concurrence Record</p>
                <p className="text-slate-600"><strong>Concurring Official:</strong> {verification?.concurrenceOfficial || 'Sh. Rajesh Verma (SDM)'}</p>
                <p className="text-slate-600"><strong>Designation:</strong> {verification?.concurrenceDesignation || 'Sub-Divisional Magistrate'}</p>
                <p className="text-slate-600"><strong>Recommended Department:</strong> {verification?.recommendedDept || 'Water Supply & Sewerage Board'}</p>
                <p className="text-slate-600"><strong>Priority Score:</strong> {verification?.priorityScore || 85} / 100</p>
                <p className="text-slate-600 italic">"{verification?.remarks || 'Verified after site visit. Storm drainage requires engineered desilting.'}"</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CHALLENGE BRIEF */}
        {activeTab === 'challenge' && (
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">University Research & Engineering Challenge</h3>
            <p className="text-xs text-slate-500">Government has issued this problem as an applied R&D challenge for higher education institutions.</p>

            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2 text-xs text-slate-800">
              <p className="font-bold text-indigo-950 text-sm">Challenge Title: Sustainable Stormwater Drainage & Desilting Mechanism</p>
              <p className="text-slate-700"><strong>Target Location:</strong> {problem.location}</p>
              <p className="text-slate-700"><strong>Required Disciplines:</strong> Civil Engineering, Hydraulic Systems, IoT Water Level Sensors, Urban Planning</p>
              <p className="text-slate-700"><strong>Expected Scope:</strong> Prototype low-cost silt trap with real-time level sensor to prevent school flooding during monsoon.</p>
            </div>
          </div>
        )}

        {/* TAB 5: TEAM & TASKS BOARD */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Multidisciplinary Student & Faculty Team</h3>
                  <p className="text-xs text-slate-500">{team?.name || 'PEC Urban Hydro Impact Team'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-900 text-sm block">Prof. Kavitha Reddy</span>
                  <span className="text-indigo-600 font-semibold block">Faculty Mentor & Research Lead</span>
                  <span className="text-slate-500 block">Civil Engineering</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-900 text-sm block">Aarav Sharma</span>
                  <span className="text-indigo-600 font-semibold block">Student Team Lead</span>
                  <span className="text-slate-500 block">Computer Science & IoT</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-900 text-sm block">Meera Patel</span>
                  <span className="text-indigo-600 font-semibold block">Hydraulics Researcher</span>
                  <span className="text-slate-500 block">Civil & Environmental Engg</span>
                </div>
              </div>
            </div>

            {/* Task Board */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Sprint Tasks & Milestones</h3>
                <button onClick={() => setShowTaskModal(true)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </button>
              </div>

              <div className="space-y-2">
                {tasks.length > 0 ? (
                  tasks.map((t: any) => (
                    <div key={t.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleTask(t.id, t.status)}
                          className={`w-4 h-4 rounded border flex items-center justify-center ${t.status === 'COMPLETED' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'}`}
                        >
                          {t.status === 'COMPLETED' && <CheckCircle className="w-3 h-3" />}
                        </button>
                        <span className={t.status === 'COMPLETED' ? 'line-through text-slate-400' : 'font-semibold text-slate-800'}>
                          {t.title}
                        </span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                        {t.priority}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No tasks currently logged. Click "Add Task" to start sprint planning.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SOLUTION PROPOSAL */}
        {activeTab === 'solution' && (
          <div className="card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Versioned Technical Solution Proposal</h3>
                <p className="text-xs text-slate-500">Version: <strong>v{solution?.version || 1}</strong> • Status: <strong>{solution?.status || 'DRAFT'}</strong></p>
              </div>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-semibold text-xs">
                Faculty Certified: {solution?.facultyApproved ? '✓ Yes' : 'Pending'}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 block">Proposed Engineering Intervention:</span>
                <p className="text-slate-700 leading-relaxed">{solution?.proposedSolution || 'Automated Silt Trap and Dual-Flow Retention Tank with Solar-Powered IoT Water Level Monitoring.'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900 block">Root Cause Analysis:</span>
                  <p className="text-slate-600">{solution?.rootCause || 'Inadequate gradient and accumulated plastic debris at culvert inlet.'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900 block">Estimated Cost:</span>
                  <p className="text-slate-600 font-bold text-indigo-700 text-sm">₹{solution?.estimatedCost ? solution.estimatedCost.toLocaleString() : '85,000'}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 block">Long-Term Sustainability & Maintenance:</span>
                <p className="text-slate-600">{solution?.sustainabilityPlan || 'Weekly automated cleaning protocol operated by municipal sanitation team with sensor alerts sent to ward junior engineer.'}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: GOVT RUBRIC REVIEW */}
        {activeTab === 'rubric' && (
          <div className="card p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900">Government 6-Criteria Scoring Rubric</h3>
            <p className="text-xs text-slate-500">Official evaluation for pilot deployment authorization.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Technical Feasibility</span>
                <span className="font-bold text-slate-900 text-base">4 / 5</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Safety & Compliance</span>
                <span className="font-bold text-slate-900 text-base">5 / 5</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Cost Reasonableness</span>
                <span className="font-bold text-slate-900 text-base">4 / 5</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Public Benefit</span>
                <span className="font-bold text-slate-900 text-base">5 / 5</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Scalability</span>
                <span className="font-bold text-slate-900 text-base">4 / 5</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Sustainability</span>
                <span className="font-bold text-slate-900 text-base">4 / 5</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
              <p className="font-bold text-sm">Overall Score: 26 / 30 • Verdict: Approved for Pilot Deployment</p>
              <p className="text-emerald-800">"The proposed solution meets municipal safety codes and cost thresholds. Authorized for Sector 12 pilot deployment."</p>
            </div>
          </div>
        )}

        {/* TAB 8: INDUSTRY SUPPORT */}
        {activeTab === 'industry' && (
          <div className="card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Industry CSR & Practical Support Marketplace</h3>
                <p className="text-xs text-slate-500">Corporate sponsorships, hardware contributions, and mentor support.</p>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-800 font-semibold border border-amber-200 rounded text-xs">
                Target: ₹85,000 • Committed: ₹1,50,000
              </span>
            </div>

            <div className="space-y-3">
              {collaborations.length > 0 ? (
                collaborations.map((c: any) => (
                  <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{c.industryPartner?.name || 'SmartCity Solutions'}</span>
                      <span className="text-slate-500 block">{c.description}</span>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs self-start sm:self-center">
                      {c.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No industry collaborations logged yet.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 9: PILOT & IMPACT */}
        {activeTab === 'pilot' && (
          <div className="card p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900">Pilot Deployment & 30/90/180-Day Citizen Feedback</h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-900 text-sm block">Deployment Site: Sector 12 Culvert No. 3</span>
              <p className="text-slate-600"><strong>Status:</strong> Active Pilot Monitoring</p>
              <p className="text-slate-600"><strong>Before:</strong> 2-3 feet floodwater stagnation after 20mm rainfall.</p>
              <p className="text-slate-600"><strong>After:</strong> Zero waterlogging observed; flood clearance time reduced to under 15 minutes.</p>
            </div>

            {/* Checkpoints */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 text-xs block">Citizen Feedback Checkpoints</span>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
                <div>
                  <span className="font-bold">30-Day Checkpoint: Confirmed Improved</span>
                  <p className="text-[11px] text-emerald-700">"Waterlogging completely cleared after yesterday's rain. Students walked freely to school."</p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800">Verified</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Immutable Activity & Decision Audit Trail</h3>
            <div className="space-y-3">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-slate-400 text-[11px]">{format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm')}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{log.remarks}</p>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Actor: {log.user?.name || 'System'} ({log.user?.role || 'SYSTEM'})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: Government Field Inspection */}
        {showVerifyModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-slate-900">Perform Government Field Inspection</h3>
              <form onSubmit={handleVerifySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="label">Verification Decision</label>
                  <select
                    className="select"
                    value={verifyForm.action}
                    onChange={(e) => setVerifyForm({ ...verifyForm, action: e.target.value })}
                  >
                    <option value="VERIFY">Officially Verify Problem</option>
                    <option value="FORWARD_TO_UNIVERSITY">Verify & Publish Challenge to Universities</option>
                    <option value="REQUEST_INFO">Request Additional Citizen Info</option>
                    <option value="REJECT">Reject Report</option>
                  </select>
                </div>

                <div className="space-y-1.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-700">Inspection Checklist</p>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={verifyForm.siteVisited}
                      onChange={(e) => setVerifyForm({ ...verifyForm, siteVisited: e.target.checked })}
                    />
                    <span>Site Visited by Field Engineer</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={verifyForm.evidenceReviewed}
                      onChange={(e) => setVerifyForm({ ...verifyForm, evidenceReviewed: e.target.checked })}
                    />
                    <span>Ground Evidence Corroborated</span>
                  </label>
                </div>

                <div>
                  <label className="label">Concurring Municipal Official</label>
                  <input
                    className="input"
                    value={verifyForm.concurrenceOfficial}
                    onChange={(e) => setVerifyForm({ ...verifyForm, concurrenceOfficial: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Recommended Department</label>
                  <input
                    className="input"
                    value={verifyForm.recommendedDept}
                    onChange={(e) => setVerifyForm({ ...verifyForm, recommendedDept: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Official Remarks</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    value={verifyForm.remarks}
                    onChange={(e) => setVerifyForm({ ...verifyForm, remarks: e.target.value })}
                    placeholder="Enter official inspection observations..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowVerifyModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading} className="btn-primary">
                    Confirm Verification
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Solution Rubric Scoring */}
        {showRubricModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-slate-900">Score Solution Rubric (1-5 Scale)</h3>
              <form onSubmit={handleRubricSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Feasibility (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      className="input"
                      value={rubricForm.feasibilityScore}
                      onChange={(e) => setRubricForm({ ...rubricForm, feasibilityScore: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="label">Safety (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      className="input"
                      value={rubricForm.safetyScore}
                      onChange={(e) => setRubricForm({ ...rubricForm, safetyScore: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="label">Cost Reasonableness (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      className="input"
                      value={rubricForm.costReasonableScore}
                      onChange={(e) => setRubricForm({ ...rubricForm, costReasonableScore: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="label">Public Benefit (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      className="input"
                      value={rubricForm.publicBenefitScore}
                      onChange={(e) => setRubricForm({ ...rubricForm, publicBenefitScore: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Official Verdict</label>
                  <select
                    className="select"
                    value={rubricForm.action}
                    onChange={(e) => setRubricForm({ ...rubricForm, action: e.target.value })}
                  >
                    <option value="APPROVE">Approved for Pilot Deployment</option>
                    <option value="APPROVE_WITH_CONDITIONS">Approved with Conditions</option>
                    <option value="REQUEST_CHANGES">Changes Requested</option>
                    <option value="REJECT">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="label">Evaluation Remarks</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    value={rubricForm.feedback}
                    onChange={(e) => setRubricForm({ ...rubricForm, feedback: e.target.value })}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowRubricModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading} className="btn-primary">
                    Submit Score
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Add Task */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-slate-900">Add Sprint Task</h3>
              <form onSubmit={handleAddTask} className="space-y-3 text-xs">
                <div>
                  <label className="label">Task Title</label>
                  <input
                    className="input"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Conduct soil permeability test"
                    required
                  />
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select className="select" value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Pledge CSR */}
        {showPledgeModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-slate-900">Commit Industry CSR Support</h3>
              <form onSubmit={handlePledgeSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="label">Contribution Type</label>
                  <select
                    className="select"
                    value={pledgeForm.collaborationType}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, collaborationType: e.target.value })}
                  >
                    <option value="FUNDING">CSR Grant / Funding</option>
                    <option value="EQUIPMENT">Hardware / IoT Sensors</option>
                    <option value="TECHNICAL_SUPPORT">Technical Mentorship</option>
                    <option value="PRACTICAL_SUPPORT">Testing Facilities</option>
                  </select>
                </div>
                <div>
                  <label className="label">Committed Amount / Value (₹)</label>
                  <input
                    type="number"
                    className="input"
                    value={pledgeForm.amount}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Description / Scope</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    value={pledgeForm.description}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowPledgeModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading} className="btn-primary">
                    Confirm Pledge
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Citizen Resolution Feedback */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-slate-900">Citizen Resolution Confirmation</h3>
              <form onSubmit={handleResolutionSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="label">On-Ground Situation</label>
                  <select
                    className="select"
                    value={resolutionStatus}
                    onChange={(e) => setResolutionStatus(e.target.value)}
                  >
                    <option value="CONFIRMED_IMPROVED">Confirmed Improved (Issue Solved)</option>
                    <option value="NOT_IMPROVED">Not Improved</option>
                    <option value="NEEDS_FOLLOW_UP">Needs Further Follow-up</option>
                  </select>
                </div>
                <div>
                  <label className="label">Citizen Feedback / Observations</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    value={resolutionComment}
                    onChange={(e) => setResolutionComment(e.target.value)}
                    placeholder="Describe how the situation looks now..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowFeedbackModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading} className="btn-primary">
                    Submit Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
