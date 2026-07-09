import type { Metadata } from 'next/types'

import type { BlogCardData } from '@/components/blog/types'

import { BlogBrowser } from '@/components/blog/BlogBrowser'
import { BlogHero } from '@/components/blog/BlogHero'
import { FeaturedGuide } from '@/components/blog/FeaturedGuide'
import { NewsletterCta } from '@/components/blog/NewsletterCta'
import { getPostImage } from '@/utilities/getPostImage'
import { estimateReadingMinutes } from '@/utilities/readingTime'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

const formatDate = (value?: null | string): string =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const [posts, categories] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 48,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        categories: true,
        content: true,
        contentType: true,
        heroImage: true,
        htmlContent: true,
        meta: true,
        publishedAt: true,
      },
      sort: '-publishedAt',
    }),
    payload
      .find({
        collection: 'categories',
        depth: 0,
        limit: 20,
        overrideAccess: false,
        select: { title: true },
        sort: 'title',
      })
      .catch(() => ({ docs: [] as { title?: null | string }[] })),
  ])

  const cards: BlogCardData[] = posts.docs.map((post) => {
    const cover = getPostImage(post)

    const cats = Array.isArray(post.categories)
      ? post.categories
          .map((c) => (c && typeof c === 'object' ? c.title || '' : ''))
          .filter((t): t is string => Boolean(t))
      : []

    return {
      categories: cats,
      cover,
      date: formatDate(post.publishedAt),
      excerpt: post.meta?.description || '',
      href: `/blogs/${post.slug}`,
      minutes: estimateReadingMinutes(post),
      title: post.title || '',
    }
  })

  const categoryNames = (categories.docs as { title?: null | string }[])
    .map((c) => c.title || '')
    .filter(Boolean)

  return (
    <div>
      <PageClient />

      <BlogHero />
      {cards.length > 0 && <FeaturedGuide posts={cards} />}

      <div id="browse-blogs" className="scroll-mt-24">
        <BlogBrowser categories={categoryNames} posts={cards} />
      </div>

      <NewsletterCta />
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    description:
      'Guides, playbooks, and expert insights on SOC 2, ISO 27001, evidence automation, and continuous compliance from the Auditious knowledge hub.',
    title: 'Blog — Auditious Knowledge Hub',
  }
}
