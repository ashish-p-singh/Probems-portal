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

  // University & Faculty interactive modals
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

  const [showSignOffModal, setShowSignOffModal] = useState(false)
  const [facultyRemarks, setFacultyRemarks] = useState('')

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
    setActionLoading(true)
    try {
      if (project?.id) {
        const res = await fetch(`/api/projects/${project.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ACCEPT_CHALLENGE' }),
        })
        if (res.ok) {
          setFeedbackMsg('University successfully accepted the challenge.')
          fetchProblem()
        }
      } else {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problemId: problem.id }),
        })
        if (res.ok) {
          setFeedbackMsg('University accepted problem and initialized research challenge.')
          fetchProblem()
        }
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

  // Ensure project exists helper
  const ensureProjectId = async (): Promise<string | null> => {
    if (project?.id) return project.id
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: problem.id }),
      })
      if (res.ok) {
        const newProj = await res.json()
        await fetchProblem()
        return newProj.id
      }
    } catch (e) {
      console.error('Error auto-creating project:', e)
    }
    return null
  }

  // 1. Faculty Assignment Handlers
  const openAssignFacultyModal = async () => {
    setShowAssignFacultyModal(true)
    setLoadingFaculty(true)
    try {
      const r = await fetch('/api/faculty')
      const data = await r.json()
      setFacultyList(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load faculty list', e)
    } finally {
      setLoadingFaculty(false)
    }
  }

  const handleAssignFaculty = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFacultyId) return
    setActionLoading(true)
    try {
      const projId = await ensureProjectId()
      if (!projId) {
        alert('Could not initialize project record.')
        return
      }
      const res = await fetch(`/api/projects/${projId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ASSIGN_FACULTY', facultyId: selectedFacultyId }),
      })
      if (res.ok) {
        setFeedbackMsg('Faculty Leader successfully assigned to this project.')
        setShowAssignFacultyModal(false)
        fetchProblem()
      } else {
        const d = await res.json()
        alert(d.error || 'Failed to assign faculty')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // 2. Team & Students Management Handlers
  const openTeamModal = async () => {
    setShowTeamModal(true)
    setLoadingCandidates(true)
    setTeamForm({
      teamName: team?.name || `${problem.title.split(' ')[0]} Multidisciplinary Team`,
      teamDescription: team?.description || 'Engineers and researchers collaborating on civic resolution',
      userId: '',
      role: 'Student Researcher',
      discipline: 'Computer Science & IoT',
      department: '',
      responsibilities: '',
    })
    try {
      const r = await fetch('/api/team-candidates')
      const data = await r.json()
      setCandidatesList(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load team candidates', e)
    } finally {
      setLoadingCandidates(false)
    }
  }

  const handleSaveTeamOrMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const projId = await ensureProjectId()
      if (!projId) return

      if (teamForm.userId) {
        // Add single member
        const res = await fetch(`/api/projects/${projId}`, {
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
        if (res.ok) {
          setFeedbackMsg('Team member successfully added.')
          setShowTeamModal(false)
          fetchProblem()
        } else {
          const d = await res.json()
          alert(d.error || 'Failed to add member')
        }
      } else {
        // Create / Update team metadata
        const res = await fetch(`/api/projects/${projId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'CREATE_TEAM',
            teamName: teamForm.teamName,
            teamDescription: teamForm.teamDescription,
          }),
        })
        if (res.ok) {
          setFeedbackMsg('Team successfully assembled.')
          setShowTeamModal(false)
          fetchProblem()
        }
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!project?.id || !confirm('Remove this member from the project team?')) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REMOVE_TEAM_MEMBER', memberId }),
      })
      if (res.ok) {
        setFeedbackMsg('Team member removed.')
        fetchProblem()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  // 3. Solution Proposal Handlers
  const openSolutionModal = () => {
    setSolutionForm({
      proposedSolution: solution?.proposedSolution || '',
      problemStatement: solution?.problemStatement || problem.title,
      rootCause: solution?.rootCause || '',
      technicalApproach: solution?.technicalApproach || '',
      expectedImpact: solution?.expectedImpact || '',
      estimatedCost: solution?.estimatedCost ? String(solution.estimatedCost) : '',
      timeline: solution?.timeline || '6 weeks',
      requiredResources: solution?.requiredResources || '',
      implementationPlan: solution?.implementationPlan || '',
      sustainabilityPlan: solution?.sustainabilityPlan || '',
      prototypeUrl: solution?.prototypeUrl || '',
      alternativesConsidered: solution?.alternativesConsidered || '',
    })
    setShowSolutionModal(true)
  }

  const handleSaveSolution = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const projId = await ensureProjectId()
      if (!projId) return

      const res = await fetch(`/api/projects/${projId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_SOLUTION_PROPOSAL',
          ...solutionForm,
        }),
      })
      if (res.ok) {
        setFeedbackMsg('Solution proposal saved successfully.')
        setShowSolutionModal(false)
        fetchProblem()
      } else {
        const d = await res.json()
        alert(d.error || 'Failed to save solution proposal')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmitToFaculty = async () => {
    if (!project?.id) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SUBMIT_TO_FACULTY' }),
      })
      if (res.ok) {
        setFeedbackMsg('Solution submitted to Faculty Mentor for academic certification.')
        fetchProblem()
      } else {
        const d = await res.json()
        alert(d.error || 'Submission failed')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleFacultySignOff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project?.id) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'FACULTY_SIGN_OFF',
          facultyRemarks: facultyRemarks || 'Approved by Faculty Leader for Government Validation',
        }),
      })
      if (res.ok) {
        setFeedbackMsg('Solution certified by Faculty Leader.')
        setShowSignOffModal(false)
        fetchProblem()
      } else {
        const d = await res.json()
        alert(d.error || 'Sign-off failed')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmitSolutionToGov = async () => {
    if (!project?.id) return
    if (!confirm('Submit this solution proposal to the Government for official rubric evaluation?')) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SUBMIT_SOLUTION' }),
      })
      if (res.ok) {
        setFeedbackMsg('Solution successfully submitted to Government for validation!')
        fetchProblem()
      } else {
        const d = await res.json()
        alert(d.error || 'Failed to submit solution')
      }
    } catch (err: any) {
      alert(err.message)
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

              {/* University & Faculty Actions */}
              {['UNIVERSITY', 'FACULTY', 'ADMIN'].includes(role) && (
                <>
                  {/* Accept challenge if not accepted yet */}
                  {problem.status === 'VERIFIED' && (
                    <button
                      onClick={handleAcceptChallenge}
                      disabled={actionLoading}
                      className="btn bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Accept Research Challenge</span>
                    </button>
                  )}

                  {/* Assign Faculty Button (University / Admin) */}
                  {['UNIVERSITY', 'ADMIN'].includes(role) && (
                    <button
                      onClick={openAssignFacultyModal}
                      disabled={actionLoading}
                      className="btn bg-violet-600 hover:bg-violet-700 text-white text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
                    >
                      <FlaskConical className="w-4 h-4" />
                      <span>{project?.facultyAssignment ? 'Change Faculty' : 'Assign Faculty'}</span>
                    </button>
                  )}

                  {/* Select Students / Assemble Team */}
                  <button
                    onClick={openTeamModal}
                    disabled={actionLoading}
                    className="btn bg-slate-800 hover:bg-slate-900 text-white text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span>{project?.team ? 'Manage Team' : 'Assemble Team'}</span>
                  </button>

                  {/* Draft / Edit Solution */}
                  <button
                    onClick={openSolutionModal}
                    disabled={actionLoading}
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{solution ? 'Edit Solution' : 'Submit Solution'}</span>
                  </button>

                  {/* Submit to Faculty (University) */}
                  {role === 'UNIVERSITY' && solution && ['DRAFT', 'CHANGES_REQUESTED'].includes(solution.status) && project?.facultyAssignment && (
                    <button
                      onClick={handleSubmitToFaculty}
                      disabled={actionLoading}
                      className="btn bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm font-semibold"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Submit to Faculty Leader</span>
                    </button>
                  )}

                  {/* Faculty Review Sign-off (Faculty) */}
                  {['FACULTY', 'ADMIN'].includes(role) && solution && (!solution.facultyApproved || solution.status === 'FACULTY_REVIEW') && (
                    <button
                      onClick={() => setShowSignOffModal(true)}
                      disabled={actionLoading}
                      className="btn bg-violet-600 hover:bg-violet-700 text-white text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm animate-pulse"
                    >
                      <Award className="w-4 h-4" />
                      <span>Certify Solution</span>
                    </button>
                  )}

                  {/* Submit Solution to Government */}
                  {solution && ['DRAFT', 'FACULTY_REVIEW', 'CHANGES_REQUESTED'].includes(solution.status) && (
                    <button
                      onClick={handleSubmitSolutionToGov}
                      disabled={actionLoading}
                      className="btn bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>Submit to Government</span>
                    </button>
                  )}
                </>
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
            {/* Faculty Mentor Section */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Faculty Leader & Academic Mentor</h3>
                  <p className="text-xs text-slate-500">Provides institutional oversight, technical guidance, and certifies solutions.</p>
                </div>
                {['UNIVERSITY', 'ADMIN'].includes(role) && (
                  <button
                    onClick={openAssignFacultyModal}
                    className="btn bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 text-xs px-3 py-1.5 flex items-center gap-1 font-semibold"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>{project?.facultyAssignment ? 'Change Faculty Leader' : 'Assign Faculty Leader'}</span>
                  </button>
                )}
              </div>

              {project?.facultyAssignment?.faculty ? (
                <div className="p-4 bg-violet-50/60 rounded-xl border border-violet-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {project.facultyAssignment.faculty.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{project.facultyAssignment.faculty.name}</h4>
                      <p className="text-xs text-violet-700 font-medium">
                        {project.facultyAssignment.faculty.faculty?.designation || 'Faculty Leader'} • {project.facultyAssignment.faculty.faculty?.department || 'Engineering Department'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{project.facultyAssignment.faculty.email}</p>
                    </div>
                  </div>
                  {project.facultyAssignment.faculty.faculty?.expertise && (
                    <div className="text-right text-xs max-w-xs">
                      <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">Specialization</span>
                      <span className="text-slate-700 font-medium">{project.facultyAssignment.faculty.faculty.expertise}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                  <FlaskConical className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No Faculty Leader Assigned</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    A faculty leader must be designated to guide the multidisciplinary team and sign off on solution proposals.
                  </p>
                  {['UNIVERSITY', 'ADMIN'].includes(role) && (
                    <button
                      onClick={openAssignFacultyModal}
                      className="btn-primary text-xs mt-2"
                    >
                      Assign Faculty Leader
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Multidisciplinary Student Team Section */}
            <div className="card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Multidisciplinary Student Team</h3>
                  <p className="text-xs text-slate-500">
                    {team?.name || 'Project Team'} {team?.description ? `— ${team.description}` : ''}
                  </p>
                </div>
                {['UNIVERSITY', 'FACULTY', 'ADMIN'].includes(role) && (
                  <button
                    onClick={openTeamModal}
                    className="btn bg-slate-900 hover:bg-black text-white text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-sm font-semibold self-start sm:self-auto"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{team ? 'Select Students / Add Member' : 'Assemble Team'}</span>
                  </button>
                )}
              </div>

              {team?.members && team.members.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {team.members.map((m: any) => (
                    <div key={m.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 relative group hover:border-indigo-200 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">{m.user?.name || 'Student Member'}</span>
                          <span className="text-indigo-600 font-semibold block">{m.role}</span>
                          <span className="text-slate-500 block">{m.discipline} {m.department ? `(${m.department})` : ''}</span>
                        </div>
                        {['UNIVERSITY', 'FACULTY', 'ADMIN'].includes(role) && (
                          <button
                            onClick={() => handleRemoveMember(m.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Member"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      {m.responsibilities && (
                        <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
                          {m.responsibilities}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No Team Members Added Yet</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Assemble a multidisciplinary student team by selecting registered students from engineering, science, and public policy disciplines.
                  </p>
                  {['UNIVERSITY', 'FACULTY', 'ADMIN'].includes(role) && (
                    <button
                      onClick={openTeamModal}
                      className="btn-primary text-xs"
                    >
                      Select Students & Assemble Team
                    </button>
                  )}
                </div>
              )}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Versioned Technical Solution Proposal</h3>
                <p className="text-xs text-slate-500">
                  Version: <strong>v{solution?.version || 1}</strong> • Status: <strong className="text-indigo-600">{solution?.status || 'DRAFT'}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded font-semibold text-xs border ${
                  solution?.facultyApproved
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : solution?.status === 'FACULTY_REVIEW'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {solution?.facultyApproved
                    ? `✓ Certified by ${project?.facultyAssignment?.faculty?.name || 'Faculty Leader'}`
                    : solution?.status === 'FACULTY_REVIEW'
                    ? '⏳ In Faculty Review'
                    : 'Pending Faculty Sign-off'}
                </span>

                {['UNIVERSITY', 'FACULTY', 'ADMIN'].includes(role) && (
                  <button
                    onClick={openSolutionModal}
                    className="btn bg-slate-900 hover:bg-black text-white text-xs px-3 py-1.5 flex items-center gap-1 shadow-sm font-semibold"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{solution ? 'Edit Solution' : 'Draft Solution'}</span>
                  </button>
                )}

                {role === 'UNIVERSITY' && solution && ['DRAFT', 'CHANGES_REQUESTED'].includes(solution.status) && project?.facultyAssignment && (
                  <button
                    onClick={handleSubmitToFaculty}
                    disabled={actionLoading}
                    className="btn bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-xs px-3 py-1.5 flex items-center gap-1 shadow-sm font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Submit to Faculty</span>
                  </button>
                )}

                {['FACULTY', 'ADMIN'].includes(role) && solution && (!solution.facultyApproved || solution.status === 'FACULTY_REVIEW') && (
                  <button
                    onClick={() => setShowSignOffModal(true)}
                    disabled={actionLoading}
                    className="btn bg-violet-600 hover:bg-violet-700 text-white text-xs px-3 py-1.5 flex items-center gap-1 shadow-sm font-semibold"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Certify Solution</span>
                  </button>
                )}

                {solution && ['DRAFT', 'FACULTY_REVIEW', 'CHANGES_REQUESTED'].includes(solution.status) && ['UNIVERSITY', 'FACULTY', 'ADMIN'].includes(role) && (
                  <button
                    onClick={handleSubmitSolutionToGov}
                    disabled={actionLoading}
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 flex items-center gap-1 shadow-sm font-semibold"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Submit to Government</span>
                  </button>
                )}
              </div>
            </div>

            {solution?.facultyRemarks && (
              <div className="p-4 bg-violet-50/70 border border-violet-100 rounded-xl text-xs space-y-1">
                <span className="font-bold text-violet-900 block flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-violet-600" />
                  Faculty Mentor Endorsement Remarks:
                </span>
                <p className="text-violet-800 italic">"{solution.facultyRemarks}"</p>
                {solution.facultyApprovedAt && (
                  <span className="text-[11px] text-violet-500 block">
                    Certified on {format(new Date(solution.facultyApprovedAt), 'dd MMM yyyy, hh:mm a')}
                  </span>
                )}
              </div>
            )}

            {solution ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900 block">Proposed Engineering Intervention:</span>
                  <p className="text-slate-700 leading-relaxed text-sm font-medium">{solution.proposedSolution}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">Root Cause Analysis:</span>
                    <p className="text-slate-600 leading-relaxed">{solution.rootCause}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">Technical Approach & Methodology:</span>
                    <p className="text-slate-600 leading-relaxed">{solution.technicalApproach}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">Estimated Budget:</span>
                    <p className="text-indigo-700 font-bold text-sm">
                      {solution.estimatedCost ? `₹${solution.estimatedCost.toLocaleString('en-IN')}` : 'To be estimated'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">Expected Deployment Timeline:</span>
                    <p className="text-slate-700 font-medium">{solution.timeline || '6-8 weeks'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">Prototype / Blueprint URL:</span>
                    {solution.prototypeUrl ? (
                      <a href={solution.prototypeUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium truncate block">
                        {solution.prototypeUrl}
                      </a>
                    ) : (
                      <span className="text-slate-400">None attached</span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900 block">Expected Community Impact:</span>
                  <p className="text-slate-700 leading-relaxed">{solution.expectedImpact}</p>
                </div>

                {solution.implementationPlan && (
                  <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">Phased Pilot Implementation Plan:</span>
                    <p className="text-slate-600 leading-relaxed">{solution.implementationPlan}</p>
                  </div>
                )}

                {solution.sustainabilityPlan && (
                  <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">Long-Term Sustainability & Maintenance:</span>
                    <p className="text-slate-600 leading-relaxed">{solution.sustainabilityPlan}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No Solution Proposal Submitted Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  The research team can draft a comprehensive engineering solution proposal including root-cause analysis, methodology, cost estimation, and sustainability plan.
                </p>
                {['UNIVERSITY', 'FACULTY', 'ADMIN'].includes(role) && (
                  <button
                    onClick={openSolutionModal}
                    className="btn-primary text-xs"
                  >
                    Draft Technical Solution Proposal
                  </button>
                )}
              </div>
            )}
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
                      disabled={!selectedFacultyId || actionLoading}
                      className="btn bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      {actionLoading ? 'Assigning...' : 'Assign Faculty Leader'}
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
                {!team && (
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
                  <button type="submit" disabled={actionLoading} className="btn-primary">
                    {actionLoading ? 'Saving...' : teamForm.userId ? 'Add Member to Team' : 'Assemble Team'}
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
                    <button type="submit" disabled={actionLoading} className="btn bg-slate-800 hover:bg-slate-900 text-white">
                      {actionLoading ? 'Saving...' : 'Save Draft'}
                    </button>
                    {role === 'UNIVERSITY' && project?.facultyAssignment && (
                      <button
                        type="button"
                        onClick={async (e) => {
                          await handleSaveSolution(e)
                          await handleSubmitToFaculty()
                        }}
                        disabled={actionLoading}
                        className="btn bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        Save & Submit to Faculty
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async (e) => {
                        await handleSaveSolution(e)
                        await handleSubmitSolutionToGov()
                      }}
                      disabled={actionLoading}
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
                    placeholder="e.g. Solution methodology reviewed. The IoT sensor specs and hydraulic calculations meet municipal requirements."
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
                  <button type="submit" disabled={actionLoading} className="btn bg-violet-600 hover:bg-violet-700 text-white">
                    {actionLoading ? 'Certifying...' : 'Certify Solution Proposal'}
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
