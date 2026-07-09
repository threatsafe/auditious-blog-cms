'use client'

import { ArrowRight, Clock, Search } from 'lucide-react'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'

import { Media } from '@/components/Media'

import { BlogTileArt } from './BlogTileArt'
import type { BlogCardData } from './types'

export const BlogBrowser: React.FC<{ categories: string[]; posts: BlogCardData[] }> = ({
  categories,
  posts,
}) => {
  const [active, setActive] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((p) => {
      const matchesCategory = active === 'All' || p.categories.includes(active)
      const matchesQuery = !q || p.title.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [posts, active, query])

  const pills = ['All', ...categories]

  return (
    <section className="container py-10">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Browse all blogs</h2>

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {pills.map((c) => (
              <button
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  active === c
                    ? 'bg-emerald-600 text-white'
                    : 'border border-gray-200 text-gray-700 hover:border-emerald-700 hover:text-emerald-700'
                }`}
                key={c}
                onClick={() => setActive(c)}
                type="button"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/15"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            type="search"
            value={query}
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="mt-12 text-gray-500">No articles found.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <article
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/60 p-3 shadow-sm backdrop-blur-md transition-all duration-300 will-change-transform hover:z-10 hover:scale-[1.03] hover:border-emerald-200 hover:shadow-2xl"
              key={i}
            >
              {/* Glassmorphism shine sweep on hover */}
              <span className="pointer-events-none absolute inset-y-0 -left-1/3 z-20 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:left-[130%] group-hover:opacity-100" />

              <Link
                className="relative block aspect-[16/10] overflow-hidden rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950"
                href={post.href}
              >
                {post.cover ? (
                  <Media
                    fill
                    imgClassName="object-cover transition-transform duration-500 group-hover:scale-110"
                    pictureClassName="absolute inset-0 block h-full w-full"
                    resource={post.cover}
                    size="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <BlogTileArt seed={post.title || post.categories[0] || 'blog'} />
                )}
              </Link>

              <div className="flex flex-1 flex-col p-3">
                <div className="flex items-center gap-3">
                  {post.categories.slice(0, 2).map((c) => (
                    <span
                      className="rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800"
                      key={c}
                    >
                      {c}
                    </span>
                  ))}
                  <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    {post.minutes} minutes
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-bold leading-snug text-gray-900">
                  <Link className="transition-colors hover:text-emerald-800" href={post.href}>
                    {post.title}
                  </Link>
                </h3>

                <Link
                  className="group/link mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"
                  href={post.href}
                >
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
