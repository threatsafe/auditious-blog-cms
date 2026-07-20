import type { Post } from '../payload-types'

import { getImageURL } from './generateMeta'
import { getServerSideURL } from './getURL'

const SITE_NAME = 'Auditious Blog'
const ORG_NAME = 'Auditious'

type FaqItem = { question: string; answer: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonLdObject = Record<string, any>

/** schema.org Organization for the site (publisher of every article). */
export const getOrganizationSchema = (): JsonLdObject => {
  const site = getServerSideURL()
  return {
    '@type': 'Organization',
    '@id': `${site}/#organization`,
    name: ORG_NAME,
    url: site,
    logo: { '@type': 'ImageObject', url: `${site}/logo.png` },
  }
}

/** schema.org WebSite with a Sitelinks Search Box action. */
export const getWebSiteSchema = (): JsonLdObject => {
  const site = getServerSideURL()
  return {
    '@type': 'WebSite',
    '@id': `${site}/#website`,
    name: SITE_NAME,
    url: site,
    publisher: { '@id': `${site}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${site}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** Site-wide graph injected once in the root layout. */
export const getSiteJsonLd = (): JsonLdObject => ({
  '@context': 'https://schema.org',
  '@graph': [getOrganizationSchema(), getWebSiteSchema()],
})

const getArticleSchema = (post: Post, url: string): JsonLdObject => {
  const image = getImageURL(post.meta?.image ?? post.heroImage)

  const authors = (post.populatedAuthors ?? [])
    .map((a) => a?.name)
    .filter((name): name is string => Boolean(name))
    .map((name) => ({ '@type': 'Person', name }))

  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.meta?.title || post.title,
    description: post.meta?.description || undefined,
    image: image ? [image] : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    author: authors.length ? authors : { '@type': 'Organization', name: ORG_NAME },
    publisher: getOrganizationSchema(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  }
}

const getBreadcrumbSchema = (post: Post, url: string): JsonLdObject => {
  const site = getServerSideURL()
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${site}/blogs` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  }
}

const getFaqSchema = (faqs: FaqItem[]): JsonLdObject | null => {
  const valid = faqs.filter((f) => f.question && f.answer)
  if (!valid.length) return null
  return {
    '@type': 'FAQPage',
    mainEntity: valid.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

/**
 * Full JSON-LD graph for a blog article: BlogPosting + BreadcrumbList, plus
 * FAQPage when the post has FAQs. Returned as a single @graph document.
 */
export const getPostJsonLd = (
  post: Post,
  opts: { url: string; faqs: FaqItem[] },
): JsonLdObject => {
  const graph: JsonLdObject[] = [
    getArticleSchema(post, opts.url),
    getBreadcrumbSchema(post, opts.url),
  ]
  const faq = getFaqSchema(opts.faqs)
  if (faq) graph.push(faq)

  return { '@context': 'https://schema.org', '@graph': graph }
}
