import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { AIChatbot } from '@/components/ai/AIChatbot'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'SIH 26043 — Civic Problem to Sustainable Impact (Prototype)',
  description:
    'SIH 26043 Prototype: A government-university-industry platform that transforms verified civic problems and acute emergencies into real-world solutions through structured collaboration.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('sih26043-theme') || localStorage.getItem('civicbridge-theme');
                if (stored === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased transition-colors duration-150">
        <Providers>
          {children}
          <AIChatbot />
        </Providers>
      </body>
    </html>
  )
}

