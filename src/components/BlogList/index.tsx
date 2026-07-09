import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import Link from 'next/link'
import React from 'react'

export type BlogListPost = Pick<
  Post,
  'categories' | 'heroImage' | 'meta' | 'publishedAt' | 'slug' | 'title'
>

const formatDate = (value?: null | string): string =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : ''

// Themed blog-listing grid (Auditious green style). Self-contained so it does
// not affect the shared Card used by Related Posts / Search.
export const BlogList: React.FC<{ posts: BlogListPost[] }> = ({ posts }) => {
  return (
    <div className="container">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {posts?.map((post, index) => {
          if (!post || typeof post !== 'object') return null

          const href = `/blogs/${post.slug}`

          const cover =
            (post.heroImage && typeof post.heroImage === 'object' ? post.heroImage : null) ||
            (post.meta?.image && typeof post.meta.image === 'object' ? post.meta.image : null)

          const category = Array.isArray(post.categories)
            ? post.categories.find((c) => c && typeof c === 'object')
            : null
          const categoryTitle =
            category && typeof category === 'object' ? category.title || '' : ''

          const description = post.meta?.description || ''
          const date = formatDate(post.publishedAt)

          return (
            <article
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              key={index}
            >
              <Link
                className="relative block aspect-[16/9] overflow-hidden bg-gradient-to-br from-green-100 to-sky-100"
                href={href}
              >
                {cover && (
                  <Media
                    fill
                    imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
                    pictureClassName="absolute inset-0 block h-full w-full"
                    resource={cover}
                    size="(max-width: 768px) 100vw, 33vw"
                  />
                )}
              </Link>

              <div className="flex flex-1 flex-col p-5">
                {categoryTitle && (
                  <span className="mb-3 inline-block self-start rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {categoryTitle}
                  </span>
                )}

                <h3 className="mb-2 text-lg font-semibold leading-snug">
                  <Link className="transition-colors hover:text-green-700" href={href}>
                    {post.title}
                  </Link>
                </h3>

                {description && (
                  <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{description}</p>
                )}

                {date && <div className="mt-auto text-xs text-muted-foreground">{date}</div>}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
