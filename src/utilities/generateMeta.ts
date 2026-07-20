import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const SITE_NAME = 'Auditious Blog'

// Extra SEO controls added to the `meta` group (see Posts/Pages SEO tab).
type SeoControls = {
  canonicalURL?: string | null
  noindex?: boolean | null
  nofollow?: boolean | null
}

export const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.png'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  /** Absolute canonical URL for this page. Also used as the OG url. */
  url?: string
}): Promise<Metadata> => {
  const { doc, url } = args

  const ogImage = getImageURL(doc?.meta?.image)

  // Fall back to the document's own title when no SEO title is set (RankMath-style).
  const rawTitle = doc?.meta?.title || doc?.title
  const title = rawTitle ? `${rawTitle} | ${SITE_NAME}` : SITE_NAME
  const description = doc?.meta?.description || undefined

  const seo = doc?.meta as SeoControls | undefined
  const canonical = seo?.canonicalURL || url

  return {
    title,
    description,
    // Canonical + per-document robots (RankMath-style index/follow controls).
    alternates: canonical ? { canonical } : undefined,
    robots: {
      index: !seo?.noindex,
      follow: !seo?.nofollow,
    },
    openGraph: mergeOpenGraph({
      description: description || '',
      images: ogImage ? [{ url: ogImage }] : undefined,
      title,
      url: canonical || (Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/'),
    }),
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}
