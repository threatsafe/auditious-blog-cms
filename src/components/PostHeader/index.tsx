import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import React from 'react'

const formatDate = (value?: null | string): string =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

// Two-column article header: title/category/meta on the left, featured image
// on the right (matches the Auditious blog design).
export const PostHeader: React.FC<{ post: Post; readingTime?: string }> = ({
  post,
  readingTime,
}) => {
  const category = Array.isArray(post.categories)
    ? post.categories.find((c) => c && typeof c === 'object')
    : null
  const categoryTitle = category && typeof category === 'object' ? category.title || '' : ''

  const date = formatDate(post.publishedAt)
  const subtitle = post.meta?.description || ''
  const hero = post.heroImage && typeof post.heroImage === 'object' ? post.heroImage : null

  return (
    <header className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
      <div className="max-w-xl">
        {categoryTitle && (
          <span className="mb-5 inline-block rounded-full bg-emerald-100 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            {categoryTitle}
          </span>
        )}

        <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-4xl">
          {post.title}
        </h1>

        {subtitle && <p className="mb-5 text-base leading-relaxed text-gray-500">{subtitle}</p>}

        <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
          {date && (
            <span className="inline-flex items-center gap-1.5">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect height="18" rx="2" ry="2" width="18" x="3" y="4" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              {date}
            </span>
          )}
          {readingTime && (
            <span className="inline-flex items-center gap-1.5">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {readingTime}
            </span>
          )}
        </div>
      </div>

      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
        {hero && (
          <Media
            fill
            imgClassName="object-cover"
            pictureClassName="absolute inset-0 block h-full w-full"
            priority
            resource={hero}
            size="(max-width: 1024px) 100vw, 55vw"
          />
        )}
      </div>
    </header>
  )
}
