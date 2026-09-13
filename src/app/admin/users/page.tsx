'use client'

import { useEffect, useState } from 'react'
import { DashboardShell } from '@/components/layout/Sidebar'
import {
  Users, Search, Shield, CheckCircle, Ban, Trash2,
  AlertCircle, Building2, Clock, Filter, X
} from 'lucide-react'
import { format } from 'date-fns'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const fetchUsers = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (roleFilter !== 'ALL') params.set('role', roleFilter)
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    if (search) params.set('q', search)

    fetch(`/api/admin/users?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [roleFilter, statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers()
  }

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'APPROVED' ? 'SUSPENDED' : 'APPROVED'
    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, accountStatus: nextStatus }),
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, accountStatus: nextStatus } : u))
        )
        setMessage(`User account status updated to ${nextStatus}.`)
        setTimeout(() => setMessage(null), 3000)
      } else {
        alert('Failed to update status')
      }
    } catch {
      alert('Network error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        )
        setMessage(`User role updated to ${newRole}.`)
        setTimeout(() => setMessage(null), 3000)
      } else {
        alert('Failed to update role')
      }
    } catch {
      alert('Network error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This cannot be undone.`)) return
    setActionLoading(userId)
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        setMessage(`User "${userName}" was permanently deleted.`)
        setTimeout(() => setMessage(null), 3000)
      } else {
        const d = await res.json()
        alert(d.error || 'Failed to delete user')
      }
    } catch {
      alert('Network error')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Accounts Directory</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Master administration of platform accounts, roles, security status, and organizations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Total Accounts: {users.length}
            </span>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-sm flex items-center justify-between animate-fade-in shadow-sm">
            <span className="font-medium">{message}</span>
            <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="card p-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Roles</option>
                <option value="CITIZEN">Citizen</option>
                <option value="GOVERNMENT">Government</option>
                <option value="UNIVERSITY">University</option>
                <option value="FACULTY">Faculty</option>
                <option value="INDUSTRY">Industry</option>
                <option value="ADMIN">Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </form>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">User Identity</th>
                  <th className="px-6 py-3.5">Role Assignment</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Organization</th>
                  <th className="px-6 py-3.5">Joined</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Loading user accounts...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No user accounts match the current filter.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isBusy = actionLoading === u.id
                    const primaryOrg = u.memberships?.[0]?.organization

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{u.email}</div>
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={u.role}
                            disabled={isBusy}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="CITIZEN">Citizen</option>
                            <option value="GOVERNMENT">Government</option>
                            <option value="UNIVERSITY">University</option>
                            <option value="FACULTY">Faculty</option>
                            <option value="INDUSTRY">Industry</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              u.accountStatus === 'APPROVED'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : u.accountStatus === 'SUSPENDED'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {u.accountStatus}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {primaryOrg ? (
                            <div>
                              <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                                {primaryOrg.name}
                              </span>
                              {primaryOrg.department && (
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                  {primaryOrg.department}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Independent Citizen</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                          {format(new Date(u.createdAt), 'dd MMM yyyy')}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleStatusToggle(u.id, u.accountStatus)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                                u.accountStatus === 'APPROVED'
                                  ? 'border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                  : 'border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              }`}
                              title={u.accountStatus === 'APPROVED' ? 'Suspend user account' : 'Approve user account'}
                            >
                              {u.accountStatus === 'APPROVED' ? 'Suspend' : 'Approve'}
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
                              title="Delete account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
