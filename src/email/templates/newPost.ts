import type { RenderedEmail } from './confirmation'

import { escapeHtml } from '../../utilities/escapeHtml'
import { renderEmailTemplate } from '../renderEmailTemplate'

export type NewPostEmailData = {
  title: string
  url: string
  excerpt?: string | null
}

/** Notification sent to active subscribers when a post is first published. */
export const renderNewPostEmail = (args: {
  post: NewPostEmailData
  unsubscribeUrl?: string
}): RenderedEmail => {
  const { post } = args
  const excerpt = post.excerpt
    ? `<p style="margin:0 0 4px;color:#4b5563;">${escapeHtml(post.excerpt)}</p>`
    : ''

  return {
    subject: `New on Auditious Blog: ${post.title}`,
    html: renderEmailTemplate({
      preview: post.excerpt || `Read our latest post: ${post.title}`,
      heading: escapeHtml(post.title),
      bodyHtml: `<p style="margin:0 0 12px;">We just published a new article we thought you'd want to read:</p>
        ${excerpt}`,
      cta: { label: 'Read the article', url: post.url },
      unsubscribeUrl: args.unsubscribeUrl,
    }),
  }
}
