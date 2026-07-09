import type { RenderedEmail } from './confirmation'

import { getServerSideURL } from '../../utilities/getURL'
import { renderEmailTemplate } from '../renderEmailTemplate'

/** Sent immediately after a subscriber confirms (double opt-in complete). */
export const renderWelcomeEmail = (args: { unsubscribeUrl?: string }): RenderedEmail => ({
  subject: 'Welcome to Auditious Blog 🎉',
  html: renderEmailTemplate({
    preview: 'Your subscription is confirmed.',
    heading: "You're all set!",
    bodyHtml: `<p style="margin:0 0 12px;">Your subscription is confirmed — welcome aboard.</p>
      <p style="margin:0;">We'll email you when we publish new insights. In the meantime, explore our latest articles.</p>`,
    cta: { label: 'Read the blog', url: `${getServerSideURL()}/blogs` },
    unsubscribeUrl: args.unsubscribeUrl,
  }),
})
