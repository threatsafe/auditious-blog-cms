import { Linkedin } from 'lucide-react'
import React from 'react'

const MAIN_SITE = 'https://auditious.io'

const SOCIAL_LINKEDIN = 'https://www.linkedin.com/company/auditious/'
const SOCIAL_X = 'https://x.com/auditiousio'

/** X (formerly Twitter) brand mark. Lucide has no X logo, only a close-cross. */
const XIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

/** Official profiles. `rel="me"` marks them as the same entity as Organization.sameAs. */
const socials = [
  { label: 'Auditious on LinkedIn', href: SOCIAL_LINKEDIN, Icon: Linkedin },
  { label: 'Auditious on X', href: SOCIAL_X, Icon: XIcon },
]

const cols = [
  {
    title: 'SOC 2',
    links: [
      { label: 'What is SOC 2?', href: `${MAIN_SITE}/soc/what-is-soc-2` },
      { label: 'Type I vs Type II', href: `${MAIN_SITE}/soc/type-i-vs-type-ii` },
      { label: 'SOC 2 Checklist', href: `${MAIN_SITE}/soc/soc-2-checklist` },
      { label: 'SOC 1 vs SOC 2 vs SOC 3', href: `${MAIN_SITE}/soc/soc-1-vs-soc-2-vs-soc-3` },
    ],
  },
  {
    title: 'Product',
    links: [
      { label: 'Evidence Automation', href: `${MAIN_SITE}/product/evidence-automation` },
      { label: 'Auditor Portal', href: `${MAIN_SITE}/product/auditor-portal` },
      { label: 'Risk Management', href: `${MAIN_SITE}/product/risk-management` },
      { label: 'Integrations', href: `${MAIN_SITE}/product/integrations` },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: `${MAIN_SITE}/resources/documentation` },
      { label: 'Contact Us', href: `${MAIN_SITE}/#contact` },
      { label: 'Blog', href: `${MAIN_SITE}/#resources` },
      { label: 'Glossary', href: `${MAIN_SITE}/resources/glossary` },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Privacy Policy', href: `${MAIN_SITE}/privacy` },
      { label: 'Terms and Conditions', href: `${MAIN_SITE}/terms` },
      { label: 'Pricing', href: `${MAIN_SITE}/#pricing` },
      { label: 'Email Us', href: 'mailto:support@auditious.io' },
    ],
  },
  {
    title: 'Compare',
    links: [
      { label: 'Auditious vs Vanta', href: `${MAIN_SITE}/compare/auditious-vs-vanta` },
      { label: 'Auditious vs Drata', href: `${MAIN_SITE}/compare/auditious-vs-drata` },
      { label: 'Auditious vs Secureframe', href: `${MAIN_SITE}/compare/auditious-vs-secureframe` },
      { label: 'Auditious vs Sprinto', href: `${MAIN_SITE}/compare/auditious-vs-sprinto` },
    ],
  },
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
            {socials.map(({ label, href, Icon }) => (
              <a
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-emerald-400 hover:bg-emerald-400 hover:text-white"
                href={href}
                key={href}
                rel="me noopener noreferrer"
                target="_blank"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 py-8 sm:grid-cols-3 lg:grid-cols-5">
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="mb-4 text-sm font-bold text-white">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a
                      className="text-sm text-white/60 transition-colors hover:text-emerald-400"
                      href={l.href}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-white/50 sm:flex-row">
          <p>© 2026 Auditious All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
