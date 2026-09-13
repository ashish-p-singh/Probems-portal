'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Loader2, RefreshCw, AlertTriangle, Info, CheckCircle, Zap, TrendingUp } from 'lucide-react'

interface Insight {
  type: 'warning' | 'info' | 'success' | 'urgent'
  title: string
  description: string
  metric?: string
}

interface InsightsData {
  insights: Insight[]
  overallHealth: 'good' | 'moderate' | 'needs_attention'
  topRecommendation: string
}

const typeConfig = {
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  success: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  urgent: { icon: Zap, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
}

const healthConfig = {
  good: { label: 'Good', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  moderate: { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-100' },
  needs_attention: { label: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-100' },
}

export function AIInsightsCard() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/insights')
      if (!res.ok) throw new Error()
      const json = await res.json()
      setData(json)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-violet-50/60 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-indigo-900">AI Insights</span>
          {data && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${healthConfig[data.overallHealth].bg} ${healthConfig[data.overallHealth].color}`}>
              {healthConfig[data.overallHealth].label}
            </span>
          )}
        </div>
        <button onClick={load} disabled={loading} className="text-indigo-400 hover:text-indigo-600 disabled:opacity-40 transition-colors" title="Refresh insights">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-4">
        {loading && (
          <div className="flex items-center gap-3 py-4">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-indigo-800">Generating insights…</p>
              <p className="text-xs text-indigo-400">Analyzing all problems with Gemini AI</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <p className="text-sm text-slate-500 py-2">Could not generate insights. <button onClick={load} className="text-indigo-600 underline">Retry</button></p>
        )}

        {data && !loading && (
          <div className="space-y-3">
            {/* Insight cards */}
            {data.insights.map((insight, i) => {
              const cfg = typeConfig[insight.type] || typeConfig.info
              const Icon = cfg.icon
              return (
                <div key={i} className={`rounded-lg border ${cfg.border} ${cfg.bg} p-3`}>
                  <div className="flex items-start gap-2">
                    <Icon className={`w-4 h-4 ${cfg.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-xs font-semibold ${cfg.color}`}>{insight.title}</p>
                        {insight.metric && (
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color} border ${cfg.border}`}>{insight.metric}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Top recommendation */}
            <div className="rounded-lg bg-white border border-indigo-200 p-3">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-indigo-700 mb-0.5">Top Recommendation</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{data.topRecommendation}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
