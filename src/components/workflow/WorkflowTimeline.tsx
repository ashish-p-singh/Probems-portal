import { CheckCircle, Circle, Clock, XCircle } from 'lucide-react'
import { WORKFLOW_STAGES, getStageIndex } from '@/lib/workflow'

interface WorkflowTimelineProps {
  currentStatus: string
  compact?: boolean
}

export function WorkflowTimeline({ currentStatus, compact = false }: WorkflowTimelineProps) {
  const currentIndex = getStageIndex(currentStatus)

  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {WORKFLOW_STAGES.map((stage, i) => {
          const isDone = i < currentIndex
          const isActive = i === currentIndex
          const isPending = i > currentIndex
          return (
            <div key={stage.key} className="flex items-center gap-1">
              <div
                title={stage.label}
                className={`w-2.5 h-2.5 rounded-full ${
                  isDone ? 'bg-emerald-500' : isActive ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              />
              {i < WORKFLOW_STAGES.length - 1 && (
                <div className={`w-4 h-0.5 ${isDone ? 'bg-emerald-300' : 'bg-slate-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {WORKFLOW_STAGES.map((stage, i) => {
        const isDone = i < currentIndex
        const isActive = i === currentIndex
        const isPending = i > currentIndex
        const isLast = i === WORKFLOW_STAGES.length - 1

        return (
          <div key={stage.key}>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={
                  isDone ? 'workflow-step-done' :
                  isActive ? 'workflow-step-active' :
                  'workflow-step-pending'
                }>
                  {isDone ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : isActive ? (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  ) : (
                    <div className="w-2.5 h-2.5 bg-slate-300 rounded-full" />
                  )}
                </div>
                {!isLast && (
                  <div className={isDone ? 'workflow-connector-done' : 'workflow-connector-pending'} />
                )}
              </div>
              <div className="pb-4 min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-medium ${isDone ? 'text-slate-700' : isActive ? 'text-indigo-700' : 'text-slate-400'}`}>
                    {stage.label}
                  </span>
                  {isActive && (
                    <span className="badge bg-indigo-100 text-indigo-700 text-xs">Current</span>
                  )}
                  {isDone && (
                    <span className="badge bg-emerald-100 text-emerald-700 text-xs">Done</span>
                  )}
                </div>
                <p className={`text-xs ${isDone || isActive ? 'text-slate-500' : 'text-slate-300'}`}>
                  {stage.description}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
