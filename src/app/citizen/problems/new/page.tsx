'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/Sidebar'
import {
  AlertCircle, Loader2, CheckCircle, Flame, ShieldAlert,
  Sparkles, Tag, Zap, Building2, GraduationCap, ChevronRight, X
} from 'lucide-react'
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel'
import { LocationFetcher, LocationData } from '@/components/ui/LocationFetcher'
import { FileUpload, UploadedFile } from '@/components/ui/FileUpload'

const categories = [
  { value: 'DRAINAGE_FLOODING', label: 'Drainage & Flooding' },
  { value: 'WATER_SUPPLY', label: 'Water Supply' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'SANITATION', label: 'Sanitation' },
  { value: 'ROAD_TRANSPORT', label: 'Road & Transport' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'ENVIRONMENT', label: 'Environment' },
  { value: 'AGRICULTURE', label: 'Agriculture' },
  { value: 'DIGITAL_SERVICES', label: 'Digital Services' },
  { value: 'SAFETY_SECURITY', label: 'Safety & Security' },
  { value: 'OTHER', label: 'Other' },
]

export default function NewProblemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [successResult, setSuccessResult] = useState<any | null>(null)
  const [error, setError] = useState('')
  const [evidence, setEvidence] = useState<UploadedFile[]>([])

  // Emergency feature states
  const [isEmergency, setIsEmergency] = useState(false)
  const [emergencyReason, setEmergencyReason] = useState('')
  const [emergencyDeniedModal, setEmergencyDeniedModal] = useState<{
    show: boolean
    reason: string
    suggestedCategory?: string
  } | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    municipality: '',
    panchayat: '',
    district: '',
    state: '',
    affectedPopulation: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  })

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const submitProblem = async (overrideEmergency?: boolean) => {
    setLoading(true)
    setError('')
    const emergencyFlag = overrideEmergency !== undefined ? overrideEmergency : isEmergency

    setLoadingStep(
      emergencyFlag
        ? 'AI Verifying Emergency Life-Safety Criteria...'
        : 'Submitting Report & Running Auto AI Analysis...'
    )

    try {
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          evidence,
          isEmergency: emergencyFlag,
          emergencyReason: emergencyFlag ? emergencyReason : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // If AI denied emergency status (HTTP 422)
        if (res.status === 422 && data.emergencyDenied) {
          setEmergencyDeniedModal({
            show: true,
            reason: data.aiReason || data.error,
            suggestedCategory: data.suggestedCategory,
          })
          setLoading(false)
          return
        }
        throw new Error(data.error || 'Failed to submit problem report')
      }

      // Success
      setSuccessResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitProblem()
  }

  // Handle downgrading from emergency to standard submission when AI denies
  const handleDowngradeAndSubmit = async () => {
    if (emergencyDeniedModal?.suggestedCategory) {
      set('category', emergencyDeniedModal.suggestedCategory)
    }
    setIsEmergency(false)
    setEmergencyDeniedModal(null)
    await submitProblem(false)
  }

  // ─── SUCCESS SCREEN WITH AUTO AI ANALYSIS DISPLAY ──────────────────────────
  if (successResult) {
    const ai = successResult.aiAnalysis
    const isEmerg = successResult.isEmergency

    return (
      <DashboardShell>
        <div className="page-content py-8 max-w-2xl mx-auto space-y-6">
          <div className="card p-8 text-center space-y-4 border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Problem Report Registered
              </h2>
              <p className="text-sm font-mono text-indigo-600 dark:text-indigo-400 mt-1 font-semibold">
                Ref: {successResult.referenceId}
              </p>
            </div>

            {isEmerg && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow animate-pulse">
                <Flame className="w-4 h-4" />
                VERIFIED CRITICAL EMERGENCY — TOPMOST PRIORITY DISPATCHED
              </div>
            )}

            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Your civic report has been securely registered in the SIH 26043 workflow and dispatched to the competent authorities for field verification.
            </p>

            {/* AI Analysis Summary Display */}
            {ai && ai.success && (
              <div className="text-left bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/60 p-5 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-indigo-50 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                      Auto AI Analysis Results
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Gemini Engine</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <Tag className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Classified Category</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {ai.category?.replace(/_/g, ' ')}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Assessed Severity</span>
                    </div>
                    <span
                      className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        ai.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : ai.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {ai.severity}
                    </span>
                  </div>
                </div>

                {ai.summary && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic border-l-2 border-indigo-400 pl-2.5">
                    &ldquo;{ai.summary}&rdquo;
                  </p>
                )}

                {ai.actionableSteps && ai.actionableSteps.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Recommended Actionable Steps:
                    </p>
                    <ul className="space-y-1">
                      {ai.actionableSteps.map((step: string, idx: number) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5"
                        >
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {ai && ai.fallback && (
              <div className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-slate-600 dark:text-slate-400 text-left">
                ℹ️ Auto AI analysis was temporarily bypassed; your report was successfully saved with your manual classification.
              </div>
            )}

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => router.push(`/problems/${successResult.id}`)}
                className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm"
              >
                <span>Enter Problem Case Room</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="page-content">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/citizen/problems" className="hover:text-slate-900">Problems</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">New Report</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Report a Civic Problem</h1>
          <p className="text-sm text-slate-500 mt-1">
            Your report will be reviewed by government authorities and routed to universities for engineered solutions.
          </p>
        </div>

        <div className="max-w-2xl space-y-4">
          {/* AI Pre-Analysis Assistant */}
          <AIAnalysisPanel
            title={form.title}
            description={form.description}
            location={form.location}
            onCategorySelect={(cat) => set('category', cat)}
          />

          <form onSubmit={handleSubmit} className="card p-6 space-y-6">

            {/* ─── EMERGENCY DECLARATION SECTION ────────────────────────────── */}
            <div
              className={`p-4 rounded-xl border transition-all duration-200 ${
                isEmergency
                  ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isEmergency
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer flex items-center gap-2">
                      <span>Declare as Life-Safety Civic Emergency</span>
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Immediate life threat, structural collapse, gas leaks, or exposed high-voltage cables.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  id="emergencyToggle"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="w-5 h-5 accent-rose-600 cursor-pointer rounded mt-1"
                />
              </div>

              {/* Live Warning Notice displayed while writing in emergency mode */}
              {isEmergency && (
                <div className="mt-4 space-y-3 animate-fade-in">
                  <div className="p-3 bg-rose-100/80 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-900 dark:text-rose-200 text-xs space-y-1.5 shadow-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>⚠️ MANDATORY EMERGENCY REPORTING PROTOCOL & AI VERIFICATION</span>
                    </div>
                    <p>
                      You are marking this report for <strong>TOPMOST PRIORITY ESCALATION</strong>. Emergency reports bypass standard queues and trigger immediate alert dispatches to municipal and disaster management teams.
                    </p>
                    <p className="font-medium text-rose-800 dark:text-rose-300">
                      • <strong>AI Gatekeeping Active:</strong> Our AI verifies whether this report is a genuine acute emergency. Non-emergencies (routine potholes, delayed garbage, broken bulbs) <strong>WILL BE DENIED SUBMISSION</strong> to keep life-saving emergency channels open.
                    </p>
                  </div>

                  <div>
                    <label className="label text-rose-900 dark:text-rose-300 font-semibold">
                      Emergency Justification / Specific Life Threat *
                    </label>
                    <textarea
                      className="textarea border-rose-300 dark:border-rose-800 focus:ring-rose-500 text-xs"
                      value={emergencyReason}
                      onChange={(e) => setEmergencyReason(e.target.value)}
                      placeholder="Explain the imminent danger: e.g. 'Live sparking 11kV wire fallen into flood water near school entrance; electrocution risk to pedestrians.'"
                      rows={2}
                      required={isEmergency}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Problem Details */}
            <div className="form-section">
              <p className="form-section-title mb-4">Problem Details</p>
              <div className="space-y-4">
                <div>
                  <label className="label">Problem Title *</label>
                  <input
                    className="input"
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="Brief, clear description of the problem"
                    required
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select className="select" value={form.category} onChange={(e) => set('category', e.target.value)} required>
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Detailed Description *</label>
                  <textarea
                    className="textarea"
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="Describe the problem in detail. Include: when it started, how often it occurs, what impact it has, what has been done so far..."
                    rows={5}
                    required
                    minLength={50}
                  />
                  <p className="text-xs text-slate-400 mt-1">{form.description.length} characters (minimum 50)</p>
                </div>
              </div>
            </div>

            {/* Location with Auto-Detector */}
            <div className="form-section">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <p className="form-section-title mb-0">Location Details</p>
                <LocationFetcher
                  onLocationFetched={(loc: LocationData) => {
                    setForm((prev) => ({
                      ...prev,
                      location: loc.location || prev.location,
                      municipality: loc.municipality || prev.municipality,
                      panchayat: loc.panchayat || prev.panchayat,
                      district: loc.district || prev.district,
                      state: loc.state || prev.state,
                    }))
                  }}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Specific Location / Landmark *</label>
                  <input
                    className="input"
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    placeholder="e.g. Near Government High School, MG Road"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Municipality / City</label>
                    <input
                      className="input"
                      value={form.municipality}
                      onChange={(e) => set('municipality', e.target.value)}
                      placeholder="Municipal corporation / City"
                    />
                  </div>
                  <div>
                    <label className="label">Panchayat</label>
                    <input
                      className="input"
                      value={form.panchayat}
                      onChange={(e) => set('panchayat', e.target.value)}
                      placeholder="Gram Panchayat (if rural)"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">District</label>
                    <input
                      className="input"
                      value={form.district}
                      onChange={(e) => set('district', e.target.value)}
                      placeholder="District"
                    />
                  </div>
                  <div>
                    <label className="label">State *</label>
                    <input
                      className="input"
                      value={form.state}
                      onChange={(e) => set('state', e.target.value)}
                      placeholder="State"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence & Photo Upload */}
            <div className="form-section">
              <p className="form-section-title mb-4">Evidence & Attachments</p>
              <FileUpload
                label="Attach Problem Photos or Documents (Optional but recommended)"
                hint="Upload photos of road damage, leaks, garbage, or civic petitions (JPG, PNG, PDF up to 15MB)"
                multiple={true}
                onFilesChange={setEvidence}
              />
            </div>

            {/* Impact */}
            <div className="form-section">
              <p className="form-section-title mb-4">Impact</p>
              <div>
                <label className="label">Approximate Affected Population</label>
                <input
                  className="input"
                  type="number"
                  value={form.affectedPopulation}
                  onChange={(e) => set('affectedPopulation', e.target.value)}
                  placeholder="Number of people affected"
                  min="1"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-rose-950/40 border border-red-100 dark:border-rose-900 rounded-lg px-3 py-2 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className={isEmergency ? 'btn-danger flex items-center gap-2' : 'btn-primary flex items-center gap-2'}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{loadingStep || 'Submitting…'}</span>
                  </>
                ) : isEmergency ? (
                  <>
                    <Flame className="w-4 h-4" />
                    <span>Submit Verified Emergency</span>
                  </>
                ) : (
                  <span>Submit Problem Report</span>
                )}
              </button>
              <button type="button" onClick={() => router.back()} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-sm text-slate-500">
            <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">What happens next?</p>
            <ol className="space-y-1 list-decimal list-inside text-xs">
              <li>Auto-AI performs taxonomic categorization and suggests resolution approaches</li>
              <li>Government authority reviews and verifies your problem and evidence</li>
              <li>If verified, it&apos;s forwarded to a suitable university</li>
              <li>University forms a multidisciplinary team</li>
              <li>Solution is developed and validated by government</li>
              <li>Industry supports implementation</li>
              <li>Impact is measured and documented</li>
            </ol>
          </div>
        </div>

        {/* ─── AI EMERGENCY REJECTION MODAL ──────────────────────────────────── */}
        {emergencyDeniedModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="card max-w-lg w-full p-6 space-y-4 shadow-2xl border-rose-300 dark:border-rose-800">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Emergency Submission Denied by AI
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Criteria Check: Life-Safety & Disaster Prevention Protocol
                  </p>
                </div>
                <button
                  onClick={() => setEmergencyDeniedModal(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-900 dark:text-rose-200 space-y-2">
                <p className="font-semibold">AI Verification Assessment:</p>
                <p className="leading-relaxed">{emergencyDeniedModal.reason}</p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                To protect critical emergency channels, only acute life-or-death hazards or catastrophic disasters can be submitted under the Emergency protocol. You can immediately post this as a <strong>Standard Civic Report</strong> without losing any of your typed information.
              </p>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEmergencyDeniedModal(null)}
                  className="btn-secondary text-xs px-3 py-2"
                >
                  Revise Details
                </button>
                <button
                  type="button"
                  onClick={handleDowngradeAndSubmit}
                  className="btn-primary text-xs px-4 py-2 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Submit as Standard Civic Problem</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
