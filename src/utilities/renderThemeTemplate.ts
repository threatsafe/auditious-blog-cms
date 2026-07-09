import type { Post, User } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { escapeHtml } from './escapeHtml'
import { getCachedGlobal } from './getGlobals'
import { getPostContentHtml } from './getPostContentHtml'
import { getServerSideURL } from './getURL'

const SITE_NAME = 'Auditious'
const WORDS_PER_MINUTE = 200

type FaqItem = { answer: string; question: string }
type RelatedItem = {
  category: string
  date: string
  description: string
  image: string
  reading_time: string
  title: string
  url: string
}
type SocialLink = { label?: null | string; url?: null | string }

const formatDate = (value?: null | string): string =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

// Matches `<!-- {token} -->`, `{{ token }}`, and `{ token }`.
const PATTERN = /<!--\s*\{\s*(\w+)\s*\}\s*-->|\{\{\s*(\w+)\s*\}\}|\{\s*(\w+)\s*\}/g

// Replaces placeholders in `input` using `resolve`. A resolver that returns
// null leaves the original text untouched (so it is safe over CSS/JS braces).
const substitute = (input: string, resolve: (key: string) => null | string): string =>
  input.replace(PATTERN, (match, commentKey, doubleKey, singleKey) => {
    const value = resolve((commentKey || doubleKey || singleKey).toLowerCase())
    return value === null ? match : value
  })

const stripTags = (html: string): string =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const estimateReadingTime = (html: string): string => {
  const words = stripTags(html).split(' ').filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE))
  return `${minutes} min read`
}

// Loads the first author's full profile (bio/designation/avatar/social),
// bypassing the collection's locked read access for public author-card display.
const getPrimaryAuthor = async (post: Post): Promise<null | User> => {
  const first = Array.isArray(post.authors) ? post.authors[0] : null
  if (!first) return null

  const id = typeof first === 'object' ? first.id : first

  try {
    const payload = await getPayload({ config: configPromise })
    return await payload.findByID({
      id,
      collection: 'users',
      depth: 1,
      overrideAccess: true,
    })
  } catch {
    return null
  }
}

// Expands `<!-- repeat … -->…<!-- /repeat -->` regions from a data source:
// FAQ items, author social links, and related posts (the sidebar list and the
// bottom blog grid). A repeat region with no data resolves to empty markup.
const expandRepeats = (
  template: string,
  {
    faqs,
    related,
    socialLinks,
  }: { faqs: FaqItem[]; related: RelatedItem[]; socialLinks: SocialLink[] },
): string =>
  template.replace(
    /<!--\s*repeat\b([^>]*?)-->([\s\S]*?)<!--\s*\/repeat\s*-->/g,
    (_match, label: string, inner: string) => {
      const kind = label.toLowerCase()

      if (kind.includes('faq')) {
        return faqs
          .map((faq) =>
            substitute(inner, (key) => {
              if (key === 'question') return escapeHtml(faq.question)
              if (key === 'answer') return escapeHtml(faq.answer)
              return null
            }),
          )
          .join('')
      }

      if (kind.includes('social')) {
        return socialLinks
          .map((social) =>
            substitute(inner, (key) => {
              if (key === 'social_url') return escapeHtml(social.url || '')
              if (key === 'social_label') return escapeHtml(social.label || '')
              return null
            }),
          )
          .join('')
      }

      // Any other repeat region (sidebar "per item", blog grid "×3") is treated
      // as a related-posts loop.
      return related
        .map((item) =>
          substitute(inner, (key) => {
            switch (key) {
              case 'category':
                return escapeHtml(item.category)
              case 'date':
                return escapeHtml(item.date)
              case 'description':
                return escapeHtml(item.description)
              case 'image':
              case 'thumbnail':
                return escapeHtml(item.image)
              case 'read_time':
              case 'reading_time':
                return escapeHtml(item.reading_time)
              case 'title':
                return escapeHtml(item.title)
              case 'url':
                return escapeHtml(item.url)
              default:
                return null
            }
          }),
        )
        .join('')
    },
  )

/**
 * Renders a theme template for a post: expands data-backed repeat regions, then
 * substitutes all scalar placeholders. `content` is injected as HTML; every
 * other token is HTML-escaped.
 */
export const renderThemeTemplate = async ({
  post,
  template,
}: {
  post: Post
  template: string
}): Promise<string> => {
  const [contentHtml, author, settings] = await Promise.all([
    getPostContentHtml(post),
    getPrimaryAuthor(post),
    getCachedGlobal('theme-settings', 1)().catch(() => null),
  ])

  const authorName =
    author?.name ||
    (Array.isArray(post.populatedAuthors)
      ? post.populatedAuthors
          .map((a) => a?.name)
          .filter(Boolean)
          .join(', ')
      : '') ||
    ''

  const authorAvatar =
    author?.avatar && typeof author.avatar === 'object' ? author.avatar.url || '' : ''

  const heroUrl =
    post.heroImage && typeof post.heroImage === 'object' ? post.heroImage.url || '' : ''

  const categoryList = Array.isArray(post.categories)
    ? post.categories
        .map((c) => (c && typeof c === 'object' ? c.title : ''))
        .filter((title): title is string => Boolean(title))
    : []

  const dateStr = formatDate(post.publishedAt)
  const readingTime = estimateReadingTime(contentHtml)
  const url = `${getServerSideURL()}/blogs/${post.slug}`
  const excerpt = post.meta?.description || ''
  const enc = encodeURIComponent

  // Raw HTML tokens — NOT escaped.
  const rawTokens: Record<string, string> = {
    content: contentHtml,
  }

  // Text tokens — HTML-escaped on output.
  const textTokens: Record<string, string> = {
    author: authorName,
    author_avatar: authorAvatar,
    author_bio: author?.bio || '',
    author_designation: author?.designation || '',
    author_name: authorName,
    canonical_url: url,
    categories: categoryList.join(', '),
    category: categoryList[0] || '',
    cta_button_label: settings?.ctaButtonLabel || '',
    cta_heading: settings?.ctaHeading || '',
    cta_subheading: settings?.ctaSubheading || '',
    cta_url: settings?.ctaButtonUrl || '',
    date: dateStr,
    description: excerpt,
    excerpt: excerpt,
    facebook_share_url: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    featured_image: heroUrl,
    featured_image_alt: post.title,
    hero_image: heroUrl,
    linkedin_share_url: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    newsletter_description: settings?.newsletterDescription || '',
    newsletter_heading: settings?.newsletterHeading || '',
    permalink: url,
    published_date: dateStr,
    publishedat: dateStr,
    read_time: readingTime,
    reading_time: readingTime,
    seo_title: post.title,
    site_name: SITE_NAME,
    sitename: SITE_NAME,
    slug: post.slug || '',
    title: post.title,
    url: url,
    x_share_url: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(post.title)}`,
  }

  // Known slots without a data source — blanked so no literal `{token}` shows.
  const blankTokens = new Set<string>(['curly', 'image', 'thumbnail'])

  const resolveGlobal = (key: string): null | string => {
    if (key in rawTokens) return rawTokens[key]
    if (key in textTokens) return escapeHtml(textTokens[key])
    if (blankTokens.has(key)) return ''
    return null
  }

  const faqs: FaqItem[] = Array.isArray(post.faqs)
    ? post.faqs
        .filter((f) => f && (f.question || f.answer))
        .map((f) => ({ answer: f.answer || '', question: f.question || '' }))
    : []

  const socialLinks: SocialLink[] = Array.isArray(author?.socialLinks) ? author.socialLinks : []

  const related: RelatedItem[] = (Array.isArray(post.relatedPosts) ? post.relatedPosts : [])
    .filter((p): p is Post => Boolean(p) && typeof p === 'object')
    .map((p) => {
      const cats = Array.isArray(p.categories)
        ? p.categories
            .map((c) => (c && typeof c === 'object' ? c.title : ''))
            .filter((title): title is string => Boolean(title))
        : []
      const image = p.heroImage && typeof p.heroImage === 'object' ? p.heroImage.url || '' : ''

      return {
        category: cats[0] || '',
        date: formatDate(p.publishedAt),
        description: p.meta?.description || '',
        image,
        reading_time: '',
        title: p.title || '',
        url: `${getServerSideURL()}/blogs/${p.slug}`,
      }
    })

  const expanded = expandRepeats(template, { faqs, related, socialLinks })
  return substitute(expanded, resolveGlobal)
}
