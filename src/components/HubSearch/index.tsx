'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

// Hero search box for the knowledge hub — routes to the existing /search page.
export const HubSearch: React.FC = () => {
  const router = useRouter()
  const [q, setQ] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = q.trim()
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
  }

  return (
    <form className="relative mx-auto mt-8 max-w-xl" onSubmit={onSubmit}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        className="w-full rounded-full border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search articles, guides, frameworks…"
        type="search"
        value={q}
      />
    </form>
  )
}
