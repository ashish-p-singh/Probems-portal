import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle,
  Shield,
  University,
  Users,
  Building2,
  TrendingUp,
  ChevronRight,
} from 'lucide-react'

const workflow = [
  { step: '01', actor: 'Citizen', action: 'Reports a verified civic problem', icon: '👤', color: 'bg-slate-100 text-slate-700' },
  { step: '02', actor: 'Government', action: 'Verifies with municipality/panchayat', icon: '🏛️', color: 'bg-blue-50 text-blue-700' },
  { step: '03', actor: 'University', action: 'Reviews and accepts problem', icon: '🎓', color: 'bg-indigo-50 text-indigo-700' },
  { step: '04', actor: 'University Team', action: 'Multidisciplinary team formation', icon: '👥', color: 'bg-violet-50 text-violet-700' },
  { step: '05', actor: 'Faculty Leader', action: 'Guides solution development', icon: '🔬', color: 'bg-purple-50 text-purple-700' },
  { step: '06', actor: 'Government', action: 'Validates proposed solution', icon: '✅', color: 'bg-blue-50 text-blue-700' },
  { step: '07', actor: 'Industry', action: 'Funds & supports implementation', icon: '🏭', color: 'bg-amber-50 text-amber-700' },
  { step: '08', actor: 'Platform', action: 'Measures sustainable impact', icon: '📊', color: 'bg-emerald-50 text-emerald-700' },
]

const roles = [
  { title: 'Citizens', desc: 'Report real problems with evidence', icon: '👤', href: '/login' },
  { title: 'Government', desc: 'Verify problems, validate solutions', icon: '🏛️', href: '/login' },
  { title: 'Universities', desc: 'Lead multidisciplinary solution projects', icon: '🎓', href: '/login' },
  { title: 'Faculty', desc: 'Guide and oversee university teams', icon: '🔬', href: '/login' },
  { title: 'Industry', desc: 'Collaborate and fund approved solutions', icon: '🏭', href: '/login' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SIH</span>
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">SIH 26043</span>
            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full ml-1">Prototype</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Sign in
            </Link>
            <Link href="/login" className="btn-primary text-sm">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            Smart India Hackathon 2026 · Problem Statement 26043
          </div>
          <h1 className="text-5xl font-bold text-slate-900 leading-tight mb-6">
            From civic problem<br />
            to <span className="text-indigo-600">sustainable impact</span>
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed mb-8 max-w-2xl">
            SIH 26043 Prototype connects citizens, government, universities and industry into a structured 
            workflow that converts verified real-world problems and acute emergencies into implemented solutions.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn-primary px-6 py-3 text-base">
              View Demo <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/problems/prb-demo" className="btn-secondary px-6 py-3 text-base">
              See a Live Problem
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="border-t border-slate-100 bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">The complete lifecycle</h2>
            <p className="text-slate-500">Every problem follows the same structured, accountable path.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {workflow.map((w, i) => (
              <div key={i} className="card p-4">
                <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium mb-3 ${w.color}`}>
                  <span>{w.icon}</span>
                  <span>{w.actor}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono mb-1">Step {w.step}</div>
                <p className="text-sm font-medium text-slate-800">{w.action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core principles */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-10">Built on three principles</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Government Accountability</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Every problem is verified by government authority. Every solution is validated before implementation. Complete audit trail for every transition.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">University-Led Innovation</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Multidisciplinary university teams under Faculty Leaders develop evidence-based solutions — not quick fixes.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Measured Impact</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Implementation is tracked and impact is measured. Every project ends with documented, sustainable outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="border-t border-slate-100 bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Five roles, one ecosystem</h2>
          <p className="text-slate-500 mb-8">Each role has a specific, bounded responsibility in the workflow.</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {roles.map((r) => (
              <Link key={r.title} href={r.href} className="card p-4 hover:border-indigo-200 hover:shadow-md transition-all duration-200 group">
                <div className="text-2xl mb-3">{r.icon}</div>
                <div className="font-semibold text-slate-900 text-sm mb-1 group-hover:text-indigo-700 transition-colors">{r.title}</div>
                <p className="text-xs text-slate-500">{r.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <div className="card p-8 bg-indigo-600 border-indigo-600">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-3">
              Watch the full lifecycle in action
            </h2>
            <p className="text-indigo-200 mb-6">
              Use the demo accounts to experience the platform from each role's perspective. 
              Follow PRB-2026-00001 from citizen report to sustainable impact.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-lg font-medium text-sm hover:bg-indigo-50 transition-colors">
                Open Demo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              {[
                { role: 'Citizen', email: 'citizen@demo.sih' },
                { role: 'Government', email: 'govt@demo.sih' },
                { role: 'University', email: 'university@demo.sih' },
                { role: 'Faculty', email: 'faculty@demo.sih' },
                { role: 'Industry', email: 'industry@demo.sih' },
              ].map((d) => (
                <div key={d.role} className="bg-indigo-700 rounded-lg p-2">
                  <div className="text-indigo-300 mb-0.5">{d.role}</div>
                  <div className="text-white font-mono text-xs truncate">{d.email}</div>
                  <div className="text-indigo-300">demo1234</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-slate-400">
          <div>SIH 26043 · Civic-to-Impact Platform (Prototype)</div>
          <div>Smart India Hackathon 2026</div>
        </div>
      </footer>
    </div>
  )
}
