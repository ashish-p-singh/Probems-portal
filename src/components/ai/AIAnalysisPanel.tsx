'use client'

import { useState } from 'react'
import { Sparkles, Loader2, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Tag, Zap, Building2, GraduationCap } from 'lucide-react'

interface AIAnalysisResult {
  classification: {
    category: string
    severity: string
    recommendedDepartments: string[]
    recommendedUniversityDisciplines: string[]
    summary: string
    municipalAuthority: string
  } | null
  similarProblems: Array<{
    referenceId: string
    title: string
    similarityReason: string
  }>
}

const severityColors: Record<string, string> = {
  LOW: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  MEDIUM: 'text-amber-600 bg-amber-50 border-amber-200',
  HIGH: 'text-orange-600 bg-orange-50 border-orange-200',
  CRITICAL: 'text-red-600 bg-red-50 border-red-200',
}

const categoryLabel: Record<string, string> = {
  INFRASTRUCTURE: 'Infrastructure', SANITATION: 'Sanitation', WATER_SUPPLY: 'Water Supply',
  DRAINAGE_FLOODING: 'Drainage & Flooding', ROAD_TRANSPORT: 'Road & Transport',
  ELECTRICITY: 'Electricity', HEALTHCARE: 'Healthcare', EDUCATION: 'Education',
  ENVIRONMENT: 'Environment', AGRICULTURE: 'Agriculture', DIGITAL_SERVICES: 'Digital Services',
  SAFETY_SECURITY: 'Safety & Security', OTHER: 'Other',
}

interface Props {
  title: string
  description: string
  location: string
  onCategorySelect?: (category: string) => void
}

export function AIAnalysisPanel({ title, description, location, onCategorySelect }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIAnalysisResult | null>(null)
  const [expanded, setExpanded] = useState(true)
  const [error, setError] = useState('')

  const canAnalyze = title.length > 5 && description.length > 20

  const analyze = async () => {
    if (!canAnalyze) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, location }),
      })
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      setResult(data)
      setExpanded(true)
    } catch {
      setError('AI analysis failed. You can still submit your problem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-indigo-900">AI Analysis</span>
          <span className="text-xs text-indigo-400 font-normal">Powered by Gemini</span>
        </div>
        {result && (
          <button onClick={() => setExpanded(!expanded)} className="text-indigo-400 hover:text-indigo-600">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      <div className="p-4">
        {!result && !loading && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-indigo-600">
              Let AI automatically classify your problem, assess severity, and detect similar existing reports.
            </p>
            <button
              type="button"
              onClick={analyze}
              disabled={!canAnalyze || loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors w-fit"
            >
              <Sparkles className="w-4 h-4" />
              Analyze with AI
            </button>
            {!canAnalyze && (
              <p className="text-xs text-indigo-400">Add a title and description (20+ chars) to enable AI analysis.</p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-3 py-2">
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            <div>
              <p className="text-sm font-medium text-indigo-800">Analyzing your problem…</p>
              <p className="text-xs text-indigo-400">Classifying, assessing severity, checking duplicates</p>
            </div>
          </div>
        )}

        {result && expanded && (
          <div className="space-y-4">
            {/* Similar problems warning */}
            {result.similarProblems.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-amber-800">Similar Problems Found</p>
                </div>
                <div className="space-y-1.5">
                  {result.similarProblems.map((s) => (
                    <div key={s.referenceId} className="text-xs">
                      <span className="font-mono text-amber-700 font-medium">{s.referenceId}</span>
                      <span className="text-amber-600"> — {s.title}</span>
                      <p className="text-amber-500 mt-0.5">{s.similarityReason}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-amber-500 mt-2">You can still submit — your report adds weight to the issue.</p>
              </div>
            )}

            {result.classification && (
              <>
                {/* AI Summary */}
                <div className="rounded-lg bg-white border border-indigo-100 p-3">
                  <p className="text-xs text-slate-500 mb-1">AI Summary</p>
                  <p className="text-sm text-slate-700">{result.classification.summary}</p>
                </div>

                {/* Category + Severity */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white border border-indigo-100 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Tag className="w-3.5 h-3.5 text-indigo-400" />
                      <p className="text-xs text-slate-500">Suggested Category</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{categoryLabel[result.classification.category] || result.classification.category}</p>
                    {onCategorySelect && (
                      <button
                        type="button"
                        onClick={() => onCategorySelect(result.classification!.category)}
                        className="mt-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Use this
                      </button>
                    )}
                  </div>
                  <div className="rounded-lg bg-white border border-indigo-100 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <p className="text-xs text-slate-500">Severity</p>
                    </div>
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border ${severityColors[result.classification.severity] || 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                      {result.classification.severity}
                    </span>
                  </div>
                </div>

                {/* Recommended departments */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white border border-indigo-100 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <p className="text-xs text-slate-500">Government Departments</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.classification.recommendedDepartments.map((d) => (
                        <span key={d} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded px-1.5 py-0.5">{d}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-indigo-100 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
                      <p className="text-xs text-slate-500">University Disciplines</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.classification.recommendedUniversityDisciplines.slice(0, 3).map((d) => (
                        <span key={d} className="text-xs bg-violet-50 text-violet-700 border border-violet-100 rounded px-1.5 py-0.5">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={analyze}
                  className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Re-analyze
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
