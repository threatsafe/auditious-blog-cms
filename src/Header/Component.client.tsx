'use client'

import { ArrowRight, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Logo } from '@/components/Logo/Logo'

// Main marketing site the blog header/CTAs link back to. Adjust if needed.
const MAIN_SITE = 'https://auditious.io'

const links = [
  { href: `${MAIN_SITE}/#platform`, label: 'Platform' },
  { href: `${MAIN_SITE}/#bundled`, label: 'Solutions' },
  { href: `${MAIN_SITE}/#frameworks`, label: 'Frameworks' },
  { href: `${MAIN_SITE}/#resources`, label: 'Resources' },
  { href: `${MAIN_SITE}/#pricing`, label: 'Pricing' },
]

export const HeaderClient: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Close the mobile menu on navigation.
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-300 ${
        scrolled
          ? 'border-b border-[#E7E7E7] shadow-[0_4px_20px_-12px_rgba(0,0,0,0.15)]'
          : 'border-b border-transparent'
      }`}
      data-site-header
    >
      <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-16">
        <Link className="shrink-0" href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <a
              className="flex items-center gap-1 text-[14px] font-medium text-[#0B0B0B] transition-colors hover:text-[#1DA94C]"
              href={l.href}
              key={l.label}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            className="hidden h-9 items-center rounded-[8px] border border-[#DADADA] px-3.5 text-[14px] font-medium text-[#0B0B0B] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1B7049] hover:bg-[#F6F6F6] active:translate-y-0 active:scale-95 sm:flex"
            href={`${MAIN_SITE}/login`}
          >
            Log in
          </a>
          <a
            className="group hidden h-9 items-center gap-1.5 rounded-[8px] bg-[#1B7049] px-4 text-[14px] font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 active:scale-95 sm:flex"
            href={MAIN_SITE}
          >
            Book a Demo
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={2.25}
            />
          </a>

          {/* Mobile menu toggle */}
          <button
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#E4E4E4] text-[#0B0B0B] transition hover:border-[#1B7049] hover:bg-[#F6F6F6] lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 top-[76px] z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="absolute inset-x-0 top-[76px] z-50 origin-top border-b border-[#E7E7E7] bg-white px-4 pb-6 pt-2 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.25)] lg:hidden">
            <div className="flex flex-col">
              {links.map((l) => (
                <a
                  className="border-b border-[#F0F0F0] py-3.5 text-[16px] font-medium text-[#0B0B0B] transition-colors hover:text-[#1DA94C]"
                  href={l.href}
                  key={l.label}
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <a
                className="flex h-11 items-center justify-center rounded-[10px] border border-[#DADADA] text-[15px] font-medium text-[#0B0B0B] transition hover:border-[#1B7049] hover:bg-[#F6F6F6]"
                href={`${MAIN_SITE}/login`}
              >
                Log in
              </a>
              <a
                className="group flex h-11 items-center justify-center gap-1.5 rounded-[10px] bg-[#1B7049] text-[15px] font-medium text-white transition hover:opacity-95"
                href={MAIN_SITE}
              >
                Book a Demo
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  strokeWidth={2.25}
                />
              </a>
            </div>
          </nav>
        </>
      )}
    </header>
  )
}
