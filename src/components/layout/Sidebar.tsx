'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard, FileText, CheckSquare, GraduationCap,
  Users, Briefcase, BarChart3, Bell, LogOut, ChevronDown,
  Building2, FlaskConical, Factory, Settings, ShieldCheck,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

function getNavItems(role: string) {
  switch (role) {
    case 'CITIZEN':
      return [
        { href: '/citizen/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/citizen/problems', label: 'Community Problems', icon: FileText },
        { href: '/citizen/problems/new', label: 'Report Problem', icon: CheckSquare },
      ]
    case 'GOVERNMENT':
      return [
        { href: '/government/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/government/verification', label: 'Verification Queue', icon: CheckSquare },
        { href: '/government/validation', label: 'Solution Validation', icon: CheckSquare },
        { href: '/government/projects', label: 'Active Projects', icon: Briefcase },
        { href: '/government/impact', label: 'Impact', icon: BarChart3 },
      ]
    case 'UNIVERSITY':
      return [
        { href: '/university/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/university/problems', label: 'Verified Problems', icon: FileText },
        { href: '/university/projects', label: 'Projects', icon: Briefcase },
        { href: '/university/teams', label: 'Teams', icon: Users },
      ]
    case 'FACULTY':
      return [
        { href: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/faculty/projects', label: 'My Projects', icon: Briefcase },
      ]
    case 'INDUSTRY':
      return [
        { href: '/industry/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/industry/opportunities', label: 'Opportunities', icon: Briefcase },
        { href: '/industry/collaborations', label: 'My Collaborations', icon: Building2 },
      ]
    case 'ADMIN':
      return [
        { href: '/admin/approvals', label: 'Account Approvals', icon: ShieldCheck },
        { href: '/admin/users', label: 'User Directory', icon: Users },
        { href: '/admin/organizations', label: 'Organizations & Bodies', icon: Building2 },
        { href: '/admin/audit', label: 'System Audit Trail', icon: BarChart3 },
      ]
    default:
      return []
  }
}

function getRoleLabel(role: string) {
  const map: Record<string, string> = {
    CITIZEN: 'Citizen',
    GOVERNMENT: 'Government Officer',
    UNIVERSITY: 'University Admin',
    FACULTY: 'Faculty Leader',
    INDUSTRY: 'Industry Partner',
    ADMIN: 'Platform Admin',
  }
  return map[role] || role
}

function getRoleColor(role: string) {
  const map: Record<string, string> = {
    CITIZEN: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    GOVERNMENT: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300',
    UNIVERSITY: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300',
    FACULTY: 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300',
    INDUSTRY: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
    ADMIN: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300',
  }
  return map[role] || 'bg-slate-100 text-slate-700'
}

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = session?.user?.role || ''
  const navItems = getNavItems(role)
  const isSettingsActive = pathname === '/settings'

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 transition-colors duration-150">
      {/* Logo */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs">SIH</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">SIH 26043</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Role badge */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleColor(role)}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
          {getRoleLabel(role)}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? 'sidebar-item-active' : 'sidebar-item'}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}

        {/* Universal Settings Nav Item */}
        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/settings"
            className={isSettingsActive ? 'sidebar-item-active' : 'sidebar-item'}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            Profile & Settings
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between gap-2">
          <Link href="/settings" className="min-w-0 flex-1 hover:opacity-80 transition-opacity">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session?.user?.email}</p>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/settings"
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
