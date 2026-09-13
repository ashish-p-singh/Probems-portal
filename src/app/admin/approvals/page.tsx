'use client'

import { useEffect, useState } from 'react'
import { DashboardShell } from '@/components/layout/Sidebar'
import {
  ShieldCheck, AlertCircle, CheckCircle, XCircle, Clock,
  Building2, GraduationCap, Factory, UserCheck, ShieldAlert
} from 'lucide-react'
import { format } from 'date-fns'

interface PendingUser {
  id: string
  name: string
  email: string
  role: string
  accountStatus: string
  createdAt: string
  government?: { authority: string; department: string; jurisdiction: string; designation: string } | null
  university?: { university: string; department: string; designation: string } | null
  faculty?: { university: string; department: string; designation: string } | null
  industry?: { company: string; sector: string } | null
  memberships?: Array<{ organization: { name: string; type: string } }>
}

export default function AdminApprovalsPage() {
  const [users, setUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const fetchUsers = () => {
    setLoading(true)
    fetch(`/api/admin/approvals?status=${filter}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const handleDecision = async (userId: string, action: 'APPROVE' | 'SUSPEND' | 'REJECT') => {
    setActionLoading(userId)
    setMessage('')
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, remarks: `Action ${action} by Central Administrator` }),
      })
      if (res.ok) {
        setMessage(`Account successfully updated: ${action}`)
        fetchUsers()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'GOVERNMENT':
        return <Building2 className="w-4 h-4 text-blue-600" />
      case 'UNIVERSITY':
      case 'FACULTY':
        return <GraduationCap className="w-4 h-4 text-indigo-600" />
      case 'INDUSTRY':
        return <Factory className="w-4 h-4 text-amber-600" />
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-600" />
    }
  }

  return (
    <DashboardShell>
      <div className="page-content space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-indigo-600" />
              Institutional Account Approvals
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Verify and approve Government authorities, Universities, Faculty leaders, and Industry partners.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filter === 'PENDING' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Approval
            </button>
            <button
              onClick={() => setFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filter === 'APPROVED' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records
            </button>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            {message}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-48" />
                  <div className="h-3 bg-slate-100 rounded w-64" />
                </div>
                <div className="h-8 bg-slate-100 rounded w-24" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="card p-12 text-center">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No accounts matching filter: {filter}</p>
            <p className="text-xs text-slate-400 mt-1">All registrations have been reviewed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((u) => {
              const details =
                u.government?.authority ||
                u.university?.university ||
                u.faculty?.university ||
                u.industry?.company ||
                'Direct Institutional Account'
              const dept =
                u.government?.department ||
                u.faculty?.department ||
                u.industry?.sector ||
                u.memberships?.[0]?.organization?.name

              return (
                <div
                  key={u.id}
                  className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{u.name}</span>
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {getRoleIcon(u.role)}
                        {u.role}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.accountStatus === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.accountStatus === 'SUSPENDED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-3">
                      <span>{u.email}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-700">{details}</span>
                      {dept && <span>({dept})</span>}
                      <span>•</span>
                      <span>Registered {format(new Date(u.createdAt), 'dd MMM yyyy')}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {u.accountStatus !== 'APPROVED' && (
                      <button
                        onClick={() => handleDecision(u.id, 'APPROVE')}
                        disabled={actionLoading === u.id}
                        className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>
                    )}

                    {u.accountStatus !== 'SUSPENDED' && (
                      <button
                        onClick={() => handleDecision(u.id, 'SUSPEND')}
                        disabled={actionLoading === u.id}
                        className="btn bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs px-3 py-1.5 flex items-center gap-1.5"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
