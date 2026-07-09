import type { Payload } from 'payload'

import { getServerSideURL } from '../utilities/getURL'
import { buildUnsubscribeToken } from './tokens'
import { renderConfirmationEmail } from './templates/confirmation'
import { renderNewPostEmail, type NewPostEmailData } from './templates/newPost'
import { renderWelcomeEmail } from './templates/welcome'

type SubscriberRef = { id: number | string; email: string }

export const buildConfirmUrl = (rawToken: string): string =>
  `${getServerSideURL()}/api/subscribers/confirm?token=${encodeURIComponent(rawToken)}`

export const buildUnsubscribeUrl = (subscriberId: number | string): string =>
  `${getServerSideURL()}/api/subscribers/unsubscribe?token=${encodeURIComponent(
    buildUnsubscribeToken(subscriberId),
  )}`

/**
 * Best-effort stamp of the last time we emailed a subscriber. Never throws —
 * a bookkeeping failure must not break the actual send flow.
 */
const stampLastEmailSent = async (payload: Payload, subscriberId: number | string): Promise<void> => {
  try {
    await payload.update({
      collection: 'subscribers',
      id: subscriberId,
      data: { lastEmailSentAt: new Date().toISOString() },
      overrideAccess: true,
    })
  } catch (err) {
    payload.logger.error({ err, subscriberId }, 'Failed to stamp lastEmailSentAt')
  }
}

export const sendConfirmationEmail = async (
  payload: Payload,
  args: { subscriber: SubscriberRef; confirmationRawToken: string },
): Promise<void> => {
  const { subject, html } = renderConfirmationEmail({
    confirmUrl: buildConfirmUrl(args.confirmationRawToken),
    unsubscribeUrl: buildUnsubscribeUrl(args.subscriber.id),
  })
  await payload.sendEmail({ to: args.subscriber.email, subject, html })
  await stampLastEmailSent(payload, args.subscriber.id)
}

export const sendWelcomeEmail = async (
  payload: Payload,
  args: { subscriber: SubscriberRef },
): Promise<void> => {
  const { subject, html } = renderWelcomeEmail({
    unsubscribeUrl: buildUnsubscribeUrl(args.subscriber.id),
  })
  await payload.sendEmail({ to: args.subscriber.email, subject, html })
  await stampLastEmailSent(payload, args.subscriber.id)
}

export const sendNewPostNotificationEmail = async (
  payload: Payload,
  args: { subscriber: SubscriberRef; post: NewPostEmailData },
): Promise<void> => {
  const { subject, html } = renderNewPostEmail({
    post: args.post,
    unsubscribeUrl: buildUnsubscribeUrl(args.subscriber.id),
  })
  await payload.sendEmail({ to: args.subscriber.email, subject, html })
  await stampLastEmailSent(payload, args.subscriber.id)
}
