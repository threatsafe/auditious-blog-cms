import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // The blog listing now lives at the site root (`/`). Redirect the old `/blogs`
  // index there. Individual articles stay under `/blogs/:slug`, so this is an
  // EXACT match on `/blogs` only (no `:path*`).
  const blogsToRoot = [{ source: '/blogs', destination: '/', permanent: true }]

  // The blog moved from /posts to /blogs (and the index to `/`). Preserve inbound
  // links / SEO with 301s. Articles/pagination keep living under `/blogs/...`.
  const postsRedirects = [
    { source: '/posts', destination: '/', permanent: true },
    { source: '/posts/:path*', destination: '/blogs/:path*', permanent: true },
  ]

  return [...blogsToRoot, ...postsRedirects, internetExplorerRedirect]
}
