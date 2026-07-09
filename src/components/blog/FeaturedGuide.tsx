'use client'

import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import type { BlogCardData } from './types'

const RINGS = {
  backgroundImage:
    'repeating-radial-gradient(circle at 115% -10%, transparent 0, transparent 42px, rgba(52,211,153,0.14) 43px, rgba(52,211,153,0.14) 44px)',
}

const Slide: React.FC<{ post: BlogCardData }> = ({ post }) => {
  const category = post.categories[0] || 'Guide'

  return (
    <div className="rounded-3xl bg-gray-50 p-6 md:p-10">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
        {/* Left */}
        <div>
          <div className="mb-4 flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {post.minutes} min read
            </span>
          </div>

          <span className="mb-5 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700">
            {category}
          </span>

          <h2 className="text-2xl font-bold leading-tight text-gray-900 md:text-[2rem] md:leading-tight">
            {post.title}
          </h2>

          {post.excerpt && <p className="mt-4 max-w-md text-gray-500">{post.excerpt}</p>}

          <Link
            className="group mt-6 inline-flex items-center gap-2 font-semibold text-emerald-700"
            href={post.href}
          >
            Read Guide
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Right — dark emerald decorative card */}
        <Link
          className="relative flex aspect-16/11 flex-col justify-center overflow-hidden rounded-2xl bg-linear-to-br from-emerald-900 to-emerald-950 p-8 md:p-10"
          href={post.href}
        >
          <div className="pointer-events-none absolute inset-0" style={RINGS} />
          <div className="relative">
            <span className="text-sm font-semibold text-emerald-400">{category}</span>
            <h3 className="mt-3 font-serif text-2xl font-bold leading-snug text-white md:text-3xl">
              {post.title}
            </h3>
            <div className="mt-5 h-1 w-12 rounded bg-emerald-400" />
            {post.excerpt && (
              <p className="mt-5 line-clamp-2 max-w-xs text-sm leading-relaxed text-emerald-100/70">
                {post.excerpt}
              </p>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}

export const FeaturedGuide: React.FC<{ posts: BlogCardData[] }> = ({ posts }) => {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = posts.length

  const go = useCallback((next: number) => setIndex((next + count) % count), [count])

  // Auto-advance (paused on hover).
  useEffect(() => {
    if (count <= 1 || paused) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6000)
    return () => clearInterval(id)
  }, [count, paused])

  if (!count) return null

  return (
    <section className="container pb-6 pt-3">
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {posts.map((post, i) => (
            <div className="w-full shrink-0" key={i}>
              <Slide post={post} />
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {posts.map((_, i) => (
              <button
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1 rounded-full transition-all ${
                  i === index ? 'w-10 bg-emerald-700' : 'w-6 bg-emerald-200 hover:bg-emerald-300'
                }`}
                key={i}
                onClick={() => setIndex(i)}
                type="button"
              />
            ))}
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              aria-label="Previous"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-emerald-700 transition hover:border-emerald-700 hover:bg-emerald-50"
              onClick={() => go(index - 1)}
              type="button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-emerald-700 transition hover:border-emerald-700 hover:bg-emerald-50"
              onClick={() => go(index + 1)}
              type="button"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
