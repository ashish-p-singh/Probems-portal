'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  const applyTheme = (targetTheme: 'light' | 'dark', saveStorage = true) => {
    setTheme(targetTheme)
    if (targetTheme === 'dark') {
      document.documentElement.classList.add('dark')
      if (saveStorage) {
        localStorage.setItem('sih26043-theme', 'dark')
        localStorage.setItem('civicbridge-theme', 'dark')
      }
    } else {
      document.documentElement.classList.remove('dark')
      if (saveStorage) {
        localStorage.setItem('sih26043-theme', 'light')
        localStorage.setItem('civicbridge-theme', 'light')
      }
    }
  }

  useEffect(() => {
    setMounted(true)
    // 1. Light mode is default. Only enable dark if explicitly stored as 'dark'.
    const stored = localStorage.getItem('sih26043-theme') || localStorage.getItem('civicbridge-theme')
    if (stored === 'dark') {
      applyTheme('dark', false)
    } else {
      applyTheme('light', false)
    }

    // 2. Fetch server preference from database
    fetch('/api/user/theme')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.themePreference) {
          if (data.themePreference === 'dark') {
            applyTheme('dark', true)
          } else if (data.themePreference === 'light') {
            applyTheme('light', true)
          }
        }
      })
      .catch(() => {})

    // 3. Listen for theme change events from settings or other components
    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const newTheme = customEvent.detail === 'dark' ? 'dark' : 'light'
      applyTheme(newTheme, false)
    }

    window.addEventListener('sih26043-theme-change', handleCustomChange)
    window.addEventListener('civicbridge-theme-change', handleCustomChange)
    return () => {
      window.removeEventListener('sih26043-theme-change', handleCustomChange)
      window.removeEventListener('civicbridge-theme-change', handleCustomChange)
    }
  }, [])

  const toggleTheme = async () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark')
    const nextTheme: 'light' | 'dark' = isCurrentlyDark ? 'light' : 'dark'

    applyTheme(nextTheme, true)
    window.dispatchEvent(new CustomEvent('sih26043-theme-change', { detail: nextTheme }))
    window.dispatchEvent(new CustomEvent('civicbridge-theme-change', { detail: nextTheme }))

    // Persist to user record in PostgreSQL database
    try {
      await fetch('/api/user/theme', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themePreference: nextTheme }),
      })
    } catch (err) {
      console.error('Failed to sync theme with database', err)
    }
  }

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`} />
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-center cursor-pointer ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  )
}
