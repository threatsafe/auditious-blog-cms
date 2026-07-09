import type { Payload } from 'payload'

import type { RenderedEmail } from './confirmation'

import { escapeHtml } from '../../utilities/escapeHtml'
import { getServerSideURL } from '../../utilities/getURL'
import { renderEmailTemplate } from '../renderEmailTemplate'

/**
 * SCAFFOLD ONLY (this phase): the weekly digest template and its data shape
 * exist so the model/rendering are ready, but nothing schedules or sends it.
 */
export type DigestPost = {
  title: string
  url: string
  excerpt?: string | null
}

export type WeeklyDigestData = {
  rangeLabel: string
  posts: DigestPost[]
}

/**
 * Assemble the data a weekly digest would render from. Pulls the most recent
 * published posts in the given window. No email is sent here.
 */
export const buildWeeklyDigestData = async (
  payload: Payload,
  opts: { since?: Date; limit?: number } = {},
): Promise<WeeklyDigestData> => {
  const since = opts.since ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const siteUrl = getServerSideURL()

  const result = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: opts.limit ?? 10,
    where: {
      and: [
        { _status: { equals: 'published' } },
        { publishedAt: { greater_than_equal: since.toISOString() } },
      ],
    },
    sort: '-publishedAt',
  })

  return {
    rangeLabel: `${since.toLocaleDateString()} – ${new Date().toLocaleDateString()}`,
    posts: result.docs.map((doc) => ({
      title: doc.title,
      url: `${siteUrl}/blogs/${doc.slug}`,
      excerpt: doc.meta?.description ?? null,
    })),
  }
}

export const renderWeeklyDigestEmail = (args: {
  data: WeeklyDigestData
  unsubscribeUrl?: string
}): RenderedEmail => {
  const items = args.data.posts
    .map(
      (p) => `<li style="margin:0 0 12px;">
        <a href="${p.url}" style="font-weight:600;color:#059669;text-decoration:none;">${escapeHtml(p.title)}</a>
        ${p.excerpt ? `<div style="color:#4b5563;font-size:14px;">${escapeHtml(p.excerpt)}</div>` : ''}
      </li>`,
    )
    .join('')

  return {
    subject: `Your Auditious Blog weekly digest`,
    html: renderEmailTemplate({
      preview: `Highlights from ${args.data.rangeLabel}`,
      heading: 'This week on Auditious Blog',
      bodyHtml: items
        ? `<ul style="margin:0;padding-left:18px;">${items}</ul>`
        : `<p style="margin:0;">No new posts this week.</p>`,
      unsubscribeUrl: args.unsubscribeUrl,
    }),
  }
}
