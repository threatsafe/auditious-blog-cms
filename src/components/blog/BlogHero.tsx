import React from 'react'

import { FlowingLines } from './FlowingLines'
import { Typewriter } from './Typewriter'

const FRAMEWORKS = ['Compliance', 'SOC 2', 'HIPAA', 'ISO 27001', 'GDPR', 'DPDP']

export const BlogHero: React.FC = () => (
  <section className="relative overflow-hidden">
    {/* Soft green glow */}
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(55%_55%_at_50%_0%,rgba(16,185,129,0.18),transparent_70%)]" />

    {/* Decorative flowing lines (tinted for the light hero background) */}
    <FlowingLines
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      stroke="rgba(16,185,129,0.14)"
    />

    <div className="container pb-10 pt-12 md:pt-20">
      <div className="mb-5 flex items-center gap-4">
        <span className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">
          Knowledge Center
        </span>
        <span className="h-px w-14 bg-emerald-300" />
      </div>

      <h1 className="text-5xl font-extrabold leading-[1.03] tracking-tight text-gray-900 md:text-6xl">
        <Typewriter words={FRAMEWORKS} />
        <br />
        <span className="text-5xl text-emerald-600">Insights</span>
      </h1>

      <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-500">
        Expert guidance, practical implementation guides, and industry research to help security
        teams navigate compliance, reduce risk, and build lasting trust.
      </p>
    </div>
  </section>
)
