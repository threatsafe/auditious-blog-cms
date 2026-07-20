import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { PostHeader } from '@/components/PostHeader'
import { PostFaq } from '@/components/PostFaq'
import { BlogSidebar } from '@/components/BlogSidebar'
import { JsonLd } from '@/components/JsonLd'
import { generateMeta } from '@/utilities/generateMeta'
import { getPostJsonLd } from '@/utilities/structuredData'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getActiveTheme } from '@/utilities/getActiveTheme'
import { getPostContentHtml } from '@/utilities/getPostContentHtml'
import { getServerSideURL } from '@/utilities/getURL'
import { HTML_CONTENT_SCOPE_ID, prepareHtmlContent } from '@/utilities/prepareHtmlContent'
import { renderThemeTemplate } from '@/utilities/renderThemeTemplate'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/blogs/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  // Structured data (JSON-LD): Article + Breadcrumb + FAQ. Computed once and
  // rendered in both the themed and native layouts below.
  const postUrl = `${getServerSideURL()}/blogs/${post.slug}`
  const faqs = (Array.isArray(post.faqs) ? post.faqs : [])
    .filter((f) => f && (f.question || f.answer))
    .map((f) => ({ answer: f.answer || '', question: f.question || '' }))
  const jsonLd = getPostJsonLd(post, { url: postUrl, faqs })

  // If an admin has activated a custom HTML theme, it owns the full page: the
  // template is rendered in place of the default layout and the site
  // header/footer are hidden via the `data-themed-post` marker (see globals.css).
  const activeTheme = await getActiveTheme()
  if (activeTheme?.template) {
    const themedHtml = await renderThemeTemplate({ post, template: activeTheme.template })

    return (
      <>
        <JsonLd data={jsonLd} />
        <PayloadRedirects disableNotFound url={url} />
        {draft && <LivePreviewListener />}
        <div data-themed-post dangerouslySetInnerHTML={{ __html: themedHtml }} />
      </>
    )
  }

  // Native blog layout: two-column header (featured image on the right) + the
  // article body alongside a permanent Subscribe / Explore / Share sidebar.
  const contentHtml = await getPostContentHtml(post)
  const words = contentHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  const readingTime = `${Math.max(1, Math.round(words / 200))} min read`
  const shareUrl = postUrl

  const related = (Array.isArray(post.relatedPosts) ? post.relatedPosts : [])
    .filter((p): p is Post => Boolean(p) && typeof p === 'object')
    .slice(0, 4)
    .map((p) => {
      const cats = Array.isArray(p.categories)
        ? p.categories.filter((c) => c && typeof c === 'object')
        : []
      const cat = cats[0] && typeof cats[0] === 'object' ? cats[0].title || '' : ''
      return {
        desc: cat || p.meta?.description || '',
        href: `/blogs/${p.slug}`,
        title: p.title || '',
      }
    })

  return (
    <article className="pt-10 pb-16">
      <JsonLd data={jsonLd} />
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <div className="container">
        <PostHeader post={post} readingTime={readingTime} />

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1fr_340px] lg:gap-16">
          <div className="min-w-0">
            {post.contentType === 'html' && post.htmlContent ? (
              <div
                className="article-body max-w-none"
                dangerouslySetInnerHTML={{ __html: prepareHtmlContent(post.htmlContent) }}
                id={HTML_CONTENT_SCOPE_ID}
              />
            ) : post.content ? (
              <RichText
                className="article-body max-w-none"
                data={post.content}
                enableGutter={false}
              />
            ) : null}

            <PostFaq faqs={faqs} />
          </div>

          <BlogSidebar related={related} shareUrl={shareUrl} title={post.title} />
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post, url: `${getServerSideURL()}/blogs/${decodedSlug}` })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
