import { renderEmailTemplate } from '../renderEmailTemplate'

export type RenderedEmail = { subject: string; html: string }

/**
 * Double opt-in confirmation email. The confirm URL carries the one-time raw
 * confirmation token; clicking it activates the subscription.
 */
export const renderConfirmationEmail = (args: {
  confirmUrl: string
  unsubscribeUrl?: string
}): RenderedEmail => ({
  subject: 'Confirm your subscription to Auditious Blog',
  html: renderEmailTemplate({
    preview: 'One quick step to start receiving Auditious Blog updates.',
    heading: 'Confirm your subscription',
    bodyHtml: `<p style="margin:0 0 12px;">Thanks for signing up for the Auditious Blog newsletter.</p>
      <p style="margin:0;">Please confirm your email address to start receiving insights on compliance, automation, and audit readiness.</p>`,
    cta: { label: 'Confirm subscription', url: args.confirmUrl },
    unsubscribeUrl: args.unsubscribeUrl,
  }),
})
