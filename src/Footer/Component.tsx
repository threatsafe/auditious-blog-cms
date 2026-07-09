import { Linkedin, Twitter } from 'lucide-react'
import React from 'react'

const MAIN_SITE = 'https://auditious.io'

const cols = [
  {
    title: 'SOC 2',
    links: [
      'What is SOC 2?',
      'Type I vs Type II',
      'SOC 2 Checklist',
      'Free Gap Assessment',
      'TSC Controls Guide',
    ],
  },
  {
    title: 'Platform',
    links: ['Evidence Automation', 'Auditor Portal', 'Trust Center', 'Risk Management', 'Integrations'],
  },
  { title: 'Company', links: ['About', 'Careers', 'Blog', 'Customers', 'Partners'] },
  { title: 'Resources', links: ['Documentation', 'API Docs', 'Status Page', 'Security', 'Contact Us'] },
]

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden py-2 text-white" data-site-footer>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#02261C_0%,#01160F_40%,#010C08_100%)]" />

      {/* Layer 1 — green blob */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -right-[180px] -top-[260px] h-[900px] w-[900px] rounded-full opacity-25 blur-[120px]"
          style={{
            background:
              'radial-gradient(circle, #0E6B3D 0%, rgba(14,107,61,.16) 35%, transparent 72%)',
          }}
        />
      </div>

      {/* Layer 2 — aurora */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-[-30%] opacity-40 blur-[80px]"
          style={{
            background:
              'linear-gradient(120deg, transparent 0%, rgba(20,120,70,.16) 20%, rgba(16,100,58,.26) 40%, transparent 58%, rgba(24,140,75,.18) 72%, transparent 100%)',
            backgroundSize: '260% 100%',
          }}
        />
      </div>

      {/* Layer 3 — noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Decorative rings */}
      <div className="pointer-events-none absolute -right-[260px] -top-[380px] h-[1000px] w-[1000px] rounded-full border border-emerald-300/10" />
      <div className="pointer-events-none absolute -right-[210px] -top-[330px] h-[900px] w-[900px] rounded-full border border-emerald-400/15 blur-[1px]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

      <div className="relative z-20 container">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center">
          <div>
            <p className="mt-3 text-sm text-white/60">
              Auditious - The fastest path for compliance.
            </p>
          </div>
          <div className="flex gap-3">
            {[Linkedin, Twitter].map((Icon, i) => (
              <a
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-emerald-400 hover:bg-emerald-400 hover:text-[#02261C]"
                href="#"
                key={i}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 py-8 md:grid-cols-4">
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="mb-4 text-sm font-bold text-white">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      className="text-sm text-white/60 transition-colors hover:text-emerald-400"
                      href="#"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-white/50 sm:flex-row">
          <p>© 2025 Auditious Inc. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a className="hover:text-emerald-400" href={`${MAIN_SITE}/privacy`}>
              Privacy Policy
            </a>
            <a className="hover:text-emerald-400" href={`${MAIN_SITE}/terms`}>
              Terms of Service
            </a>
            <a className="hover:text-emerald-400" href="#">
              SOC 2 Report
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
