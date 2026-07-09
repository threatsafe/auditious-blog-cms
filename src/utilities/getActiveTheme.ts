import type { Theme } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

/**
 * Returns the single active theme, or null when no theme is active (in which
 * case posts fall back to the default React layout). Cached per request.
 */
export const getActiveTheme = cache(async (): Promise<Theme | null> => {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'themes',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: {
        active: {
          equals: true,
        },
      },
    })

    return result.docs?.[0] || null
  } catch {
    // Never let a theme lookup break the post page — fall back to the default layout.
    return null
  }
})
