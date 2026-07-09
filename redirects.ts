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

  // The blog moved from /posts to /blogs. Preserve inbound links / SEO with 301s.
  // The wildcard rule covers article (/posts/:slug) and pagination (/posts/page/N).
  const postsToBlogs = [
    { source: '/posts', destination: '/blogs', permanent: true },
    { source: '/posts/:path*', destination: '/blogs/:path*', permanent: true },
  ]

  return [...postsToBlogs, internetExplorerRedirect]
}
