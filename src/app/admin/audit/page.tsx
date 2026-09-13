'use client'

import { useEffect, useState } from 'react'
import { DashboardShell } from '@/components/layout/Sidebar'
import {
  ShieldAlert, Search, Filter, Clock, User, FileText,
  Activity, ArrowRight, ShieldCheck, Database
} from 'lucide-react'
import { format } from 'date-fns'

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')

  const fetchLogs = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (actionFilter !== 'ALL') params.set('action', actionFilter)
    if (search) params.set('q', search)

    fetch(`/api/admin/audit?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setLogs(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchLogs()
  }, [actionFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLogs()
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes('DELETE')) return 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900'
    if (action.includes('APPROVE') || action.includes('CREATE')) return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
    if (action.includes('REJECT') || action.includes('SUSPEND')) return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900'
    return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900'
  }

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Audit Trail</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Immutable chronological record of administrative actions, status transitions, and data events.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Events Logged: {logs.length}</span>
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="card p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search action, user, or entity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Actions</option>
                <option value="DELETE_PROBLEM">Delete Problem</option>
                <option value="ADMIN_UPDATE_USER">Admin User Update</option>
                <option value="ADMIN_DELETE_USER">Admin User Delete</option>
                <option value="ADMIN_CREATE_ORGANIZATION">Create Organization</option>
                <option value="APPROVE_MEMBERSHIP">Approve Membership</option>
              </select>
            </div>
          </form>
        </div>

        {/* Audit Log Timeline / Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Actor</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Target Entity</th>
                  <th className="px-6 py-3.5">Event Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      Loading audit records...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No audit events recorded for this query.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm')}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                          {log.user?.name || 'System / Automated'}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          {log.user?.role || 'SYSTEM'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded border ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {log.problem ? `Problem: ${log.problem.referenceId}` : log.projectId ? `Project: ${log.projectId.slice(0, 8)}...` : 'Platform Record'}
                        </div>
                        {log.previousStatus && log.newStatus && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {log.previousStatus} &rarr; {log.newStatus}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {log.remarks ? (
                          <div className="text-[11px] bg-slate-100 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 font-mono max-w-sm whitespace-pre-wrap break-all">
                            {log.remarks}
                          </div>
                        ) : log.problem ? (
                          <span>{log.problem.title}</span>
                        ) : (
                          <span className="text-slate-400 italic">No additional remarks</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
