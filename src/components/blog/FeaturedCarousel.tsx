'use client'

import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import { Media } from '@/components/Media'

import type { BlogCardData } from './types'

const DOTS = {
  backgroundImage: 'radial-gradient(rgba(255,255,255,0.22) 1.5px, transparent 1.5px)',
  backgroundSize: '16px 16px',
}

export const FeaturedCarousel: React.FC<{ posts: BlogCardData[] }> = ({ posts }) => {
  const [index, setIndex] = useState(0)
  const count = posts.length

  const go = useCallback((next: number) => setIndex((next + count) % count), [count])

  useEffect(() => {
    if (count <= 1) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 7000)
    return () => clearInterval(id)
  }, [count])

  if (!count) return null
  const post = posts[index]

  return (
    <section className="container py-10 md:py-14">
      <div className="overflow-hidden rounded-3xl bg-emerald-50/70 p-6 md:p-12">
        <div className="grid items-center gap-8 md:grid-cols-2">
          {/* Text side */}
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {post.categories.slice(0, 2).map((c) => (
                <span
                  className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800"
                  key={c}
                >
                  {c}
                </span>
              ))}
              <span className="ml-1 inline-flex items-center gap-1.5 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                {post.minutes} minutes
              </span>
            </div>

            <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-[2.75rem] md:leading-[1.1]">
              {post.title}
            </h2>

            <Link
              className="group mt-6 inline-flex items-center gap-2 text-base font-semibold text-emerald-800"
              href={post.href}
            >
              Learn more
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Visual side */}
          <Link
            className="relative flex aspect-[16/10] items-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-8"
            href={post.href}
          >
            {post.cover ? (
              <Media
                fill
                imgClassName="object-cover"
                pictureClassName="absolute inset-0 block h-full w-full"
                resource={post.cover}
                size="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <h3 className="relative z-10 font-serif text-2xl font-semibold leading-snug text-white md:text-3xl">
                {post.title}
              </h3>
            )}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 [mask-image:linear-gradient(to_top,black,transparent)]"
              style={DOTS}
            />
          </Link>
        </div>
      </div>

      {/* Controls */}
      {count > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2">
            {posts.map((_, i) => (
              <button
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1 rounded-full transition-all ${
                  i === index ? 'w-10 bg-emerald-800' : 'w-6 bg-emerald-200 hover:bg-emerald-300'
                }`}
                key={i}
                onClick={() => setIndex(i)}
                type="button"
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              aria-label="Previous"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-emerald-800 transition hover:border-emerald-800 hover:bg-emerald-50"
              onClick={() => go(index - 1)}
              type="button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-emerald-800 transition hover:border-emerald-800 hover:bg-emerald-50"
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
