import type { Endpoint, PayloadRequest } from 'payload'

import { getServerSideURL } from '../../utilities/getURL'
import { sendConfirmationEmail, sendWelcomeEmail } from '../../email/mailer'
import {
  confirmationExpiry,
  generateToken,
  hashToken,
  isExpired,
  verifyUnsubscribeToken,
} from '../../email/tokens'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalizeEmail = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : ''

const readBody = async (req: PayloadRequest): Promise<Record<string, unknown>> => {
  try {
    if (typeof req.json === 'function') return (await req.json()) as Record<string, unknown>
  } catch {
    // fall through to empty body
  }
  return {}
}

const redirect = (path: string): Response =>
  new Response(null, { status: 303, headers: { Location: `${getServerSideURL()}${path}` } })

// Identical response for every signup outcome so the endpoint never reveals
// whether an address is already known (prevents account enumeration).
const genericSignupResponse = (): Response =>
  Response.json({
    success: true,
    message: 'Check your inbox to confirm your subscription.',
  })

/** POST /api/subscribers/subscribe — public double opt-in signup. */
const subscribe: Endpoint = {
  path: '/subscribe',
  method: 'post',
  handler: async (req) => {
    const body = await readBody(req)
    const email = normalizeEmail(body.email)

    if (!EMAIL_RE.test(email)) {
      return Response.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 },
      )
    }

    const { payload } = req
    const existing = await payload.find({
      collection: 'subscribers',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })
    const subscriber = existing.docs[0]

    try {
      if (!subscriber) {
        const confirmation = generateToken()
        const created = await payload.create({
          collection: 'subscribers',
          data: {
            email,
            status: 'pending',
            confirmationTokenHash: confirmation.hash,
            confirmationTokenExpiresAt: confirmationExpiry(),
          },
          overrideAccess: true,
        })
        await sendConfirmationEmail(payload, {
          subscriber: created,
          confirmationRawToken: confirmation.raw,
        })
      } else if (subscriber.status === 'pending' || subscriber.status === 'unsubscribed') {
        // Re-issue a fresh token and resend. For a previously unsubscribed
        // address this is a safe re-opt-in: it goes back through double opt-in
        // (status -> pending) and only becomes active again on confirmation.
        const confirmation = generateToken()
        await payload.update({
          collection: 'subscribers',
          id: subscriber.id,
          data: {
            status: 'pending',
            confirmationTokenHash: confirmation.hash,
            confirmationTokenExpiresAt: confirmationExpiry(),
            unsubscribedAt: null,
          },
          overrideAccess: true,
        })
        await sendConfirmationEmail(payload, {
          subscriber,
          confirmationRawToken: confirmation.raw,
        })
      }
      // active: intentionally do nothing (non-revealing, already subscribed).
    } catch (err) {
      payload.logger.error({ err, email }, 'Subscription signup failed')
      // Still return the generic response so failures are not enumerable.
    }

    return genericSignupResponse()
  },
}

/** GET /api/subscribers/confirm?token=… — activates a pending subscriber. */
const confirm: Endpoint = {
  path: '/confirm',
  method: 'get',
  handler: async (req) => {
    const token = req.searchParams?.get('token') ?? ''
    if (!token) return redirect('/newsletter/confirmed?state=invalid')

    const { payload } = req
    const found = await payload.find({
      collection: 'subscribers',
      where: {
        and: [
          { confirmationTokenHash: { equals: hashToken(token) } },
          { status: { equals: 'pending' } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })
    const subscriber = found.docs[0]

    if (!subscriber || isExpired(subscriber.confirmationTokenExpiresAt)) {
      return redirect('/newsletter/confirmed?state=invalid')
    }

    const now = new Date().toISOString()
    await payload.update({
      collection: 'subscribers',
      id: subscriber.id,
      data: {
        status: 'active',
        confirmedAt: now,
        subscribedAt: subscriber.subscribedAt ?? now,
        confirmationTokenHash: null,
        confirmationTokenExpiresAt: null,
      },
      overrideAccess: true,
    })

    try {
      await sendWelcomeEmail(payload, { subscriber })
    } catch (err) {
      payload.logger.error({ err, id: subscriber.id }, 'Welcome email failed')
    }

    return redirect('/newsletter/confirmed')
  },
}

/** GET /api/subscribers/unsubscribe?token=… — deactivates (never deletes). */
const unsubscribe: Endpoint = {
  path: '/unsubscribe',
  method: 'get',
  handler: async (req) => {
    const token = req.searchParams?.get('token') ?? ''
    const id = verifyUnsubscribeToken(token)
    const { payload } = req

    if (id) {
      try {
        const subscriber = await payload.findByID({
          collection: 'subscribers',
          id,
          overrideAccess: true,
          disableErrors: true,
        })
        if (subscriber && subscriber.status !== 'unsubscribed') {
          await payload.update({
            collection: 'subscribers',
            id,
            data: { status: 'unsubscribed', unsubscribedAt: new Date().toISOString() },
            overrideAccess: true,
          })
        }
      } catch (err) {
        payload.logger.error({ err, id }, 'Unsubscribe failed')
      }
    }

    // Always land on the same page regardless of token validity.
    return redirect('/newsletter/unsubscribed')
  },
}

export const subscriberEndpoints: Endpoint[] = [subscribe, confirm, unsubscribe]
