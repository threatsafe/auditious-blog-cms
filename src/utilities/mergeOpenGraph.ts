import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Expert guidance on compliance, automation, and audit readiness from the Auditious Blog.',
  images: [
    {
      url: `${getServerSideURL()}/website-template-OG.png`,
    },
  ],
  siteName: 'Auditious Blog',
  title: 'Auditious Blog',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
