import type { Endpoint, Payload } from 'payload'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { subscriberEndpoints } from '@/collections/Subscribers/endpoints'
import { notifySubscribersTask } from '@/jobs/notifySubscribersTask'
import {
  buildUnsubscribeToken,
  confirmationExpiry,
  generateToken,
  verifyUnsubscribeToken,
} from '@/email/tokens'

let payload: Payload

const handlerFor = (path: string, method: string): Endpoint['handler'] => {
  const ep = subscriberEndpoints.find((e) => e.path === path && e.method === method)
  if (!ep?.handler) throw new Error(`No handler for ${method} ${path}`)
  return ep.handler
}

const subscribe = handlerFor('/subscribe', 'post')
const confirm = handlerFor('/confirm', 'get')
const unsubscribe = handlerFor('/unsubscribe', 'get')

// Build a minimal PayloadRequest-like object for the handlers under test.
const makeReq = (over: Record<string, unknown>): any => ({ payload, ...over })

const email = (name: string) => `inttest.${name}@example.com`

const cleanup = async () => {
  await payload.delete({
    collection: 'subscribers',
    where: { email: { contains: 'inttest.' } },
    overrideAccess: true,
  })
  await payload.delete({
    collection: 'posts',
    where: { slug: { contains: 'inttest-notify' } },
    overrideAccess: true,
  })
}

const findByEmail = async (address: string) => {
  const res = await payload.find({
    collection: 'subscribers',
    where: { email: { equals: address } },
    overrideAccess: true,
    limit: 1,
  })
  return res.docs[0]
}

describe('Subscribers subscription workflow', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    // Never hit real SMTP during tests.
    ;(payload as any).sendEmail = vi.fn().mockResolvedValue(undefined)
  })

  beforeEach(async () => {
    ;(payload.sendEmail as unknown as ReturnType<typeof vi.fn>).mockClear()
    await cleanup()
  })

  afterAll(async () => {
    await cleanup()
  })

  it('unsubscribe token round-trips and rejects tampering', () => {
    const token = buildUnsubscribeToken(42)
    expect(verifyUnsubscribeToken(token)).toBe('42')
    expect(verifyUnsubscribeToken(`43.${token.split('.')[1]}`)).toBeNull()
    expect(verifyUnsubscribeToken('garbage')).toBeNull()
    expect(verifyUnsubscribeToken('')).toBeNull()
  })

  it('signup creates a pending subscriber and sends a confirmation email', async () => {
    const address = email('signup')
    const res = await subscribe(makeReq({ json: async () => ({ email: address }) }))
    const body = await res.json()

    expect(body).toEqual({
      success: true,
      message: 'Check your inbox to confirm your subscription.',
    })
    const sub = await findByEmail(address)
    expect(sub.status).toBe('pending')
    expect(sub.confirmationTokenHash).toBeTruthy()
    expect(payload.sendEmail).toHaveBeenCalledTimes(1)
  })

  it('rejects an invalid email without creating a record', async () => {
    const res = await subscribe(makeReq({ json: async () => ({ email: 'not-an-email' }) }))
    expect(res.status).toBe(400)
    expect(payload.sendEmail).not.toHaveBeenCalled()
  })

  it('confirmation link activates the subscriber and clears the token', async () => {
    const address = email('confirm')
    const conf = generateToken()
    const created = await payload.create({
      collection: 'subscribers',
      data: {
        email: address,
        status: 'pending',
        confirmationTokenHash: conf.hash,
        confirmationTokenExpiresAt: confirmationExpiry(),
      },
      overrideAccess: true,
    })

    const res = await confirm(makeReq({ searchParams: new URLSearchParams({ token: conf.raw }) }))
    expect(res.status).toBe(303)

    const updated = await payload.findByID({
      collection: 'subscribers',
      id: created.id,
      overrideAccess: true,
    })
    expect(updated.status).toBe('active')
    expect(updated.confirmedAt).toBeTruthy()
    expect(updated.subscribedAt).toBeTruthy()
    expect(updated.confirmationTokenHash).toBeFalsy()
    // welcome email
    expect(payload.sendEmail).toHaveBeenCalledTimes(1)
  })

  it('rejects an expired confirmation token', async () => {
    const address = email('expired')
    const conf = generateToken()
    await payload.create({
      collection: 'subscribers',
      data: {
        email: address,
        status: 'pending',
        confirmationTokenHash: conf.hash,
        confirmationTokenExpiresAt: new Date(Date.now() - 1000).toISOString(),
      },
      overrideAccess: true,
    })

    const res = await confirm(makeReq({ searchParams: new URLSearchParams({ token: conf.raw }) }))
    expect(res.headers.get('Location')).toContain('state=invalid')
    const sub = await findByEmail(address)
    expect(sub.status).toBe('pending')
  })

  it('unsubscribe link deactivates but never deletes the record', async () => {
    const address = email('unsub')
    const created = await payload.create({
      collection: 'subscribers',
      data: { email: address, status: 'active' },
      overrideAccess: true,
    })

    const token = buildUnsubscribeToken(created.id)
    const res = await unsubscribe(makeReq({ searchParams: new URLSearchParams({ token }) }))
    expect(res.status).toBe(303)

    const updated = await payload.findByID({
      collection: 'subscribers',
      id: created.id,
      overrideAccess: true,
    })
    expect(updated.status).toBe('unsubscribed')
    expect(updated.unsubscribedAt).toBeTruthy()
  })

  it('duplicate signup for an existing subscriber returns a generic, non-revealing response', async () => {
    const address = email('dup')
    await payload.create({
      collection: 'subscribers',
      data: { email: address, status: 'active' },
      overrideAccess: true,
    })

    const res = await subscribe(makeReq({ json: async () => ({ email: address }) }))
    const body = await res.json()
    expect(body).toEqual({
      success: true,
      message: 'Check your inbox to confirm your subscription.',
    })
    // No email for an already-active address.
    expect(payload.sendEmail).not.toHaveBeenCalled()
  })

  it('re-subscribing an unsubscribed address restarts double opt-in (pending + confirmation)', async () => {
    const address = email('reoptin')
    const created = await payload.create({
      collection: 'subscribers',
      data: {
        email: address,
        status: 'unsubscribed',
        unsubscribedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })

    const res = await subscribe(makeReq({ json: async () => ({ email: address }) }))
    const body = await res.json()
    expect(body).toEqual({
      success: true,
      message: 'Check your inbox to confirm your subscription.',
    })

    const updated = await payload.findByID({
      collection: 'subscribers',
      id: created.id,
      overrideAccess: true,
    })
    expect(updated.status).toBe('pending')
    expect(updated.confirmationTokenHash).toBeTruthy()
    expect(updated.unsubscribedAt).toBeFalsy()
    expect(payload.sendEmail).toHaveBeenCalledTimes(1)
  })

  it('notification job targets only active subscribers and records the count once', async () => {
    await payload.create({
      collection: 'subscribers',
      data: { email: email('active1'), status: 'active' },
      overrideAccess: true,
    })
    await payload.create({
      collection: 'subscribers',
      data: { email: email('active2'), status: 'active' },
      overrideAccess: true,
    })
    await payload.create({
      collection: 'subscribers',
      data: { email: email('pending1'), status: 'pending' },
      overrideAccess: true,
    })
    await payload.create({
      collection: 'subscribers',
      data: { email: email('unsub1'), status: 'unsubscribed' },
      overrideAccess: true,
    })

    const post = await payload.create({
      collection: 'posts',
      data: {
        title: 'Int Notify Post',
        slug: 'inttest-notify-post',
        _status: 'published',
        notifySubscribersOnPublish: true,
        contentType: 'html',
        htmlContent: '<p>hello</p>',
      } as any,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })

    await notifySubscribersTask.handler({ input: { postId: post.id }, req: makeReq({}) } as any)

    // The DB may hold other real active subscribers, so assert by recipient
    // identity rather than a global count: both active test addresses are
    // emailed, and the pending/unsubscribed ones are not.
    const sendMock = payload.sendEmail as unknown as ReturnType<typeof vi.fn>
    const recipients = sendMock.mock.calls.map((c) => (c[0] as { to: string }).to)
    expect(recipients).toContain(email('active1'))
    expect(recipients).toContain(email('active2'))
    expect(recipients).not.toContain(email('pending1'))
    expect(recipients).not.toContain(email('unsub1'))

    const refreshed = await payload.findByID({
      collection: 'posts',
      id: post.id,
      overrideAccess: true,
    })
    // Recorded count matches the number of emails actually sent this run.
    expect(refreshed.subscriberNotificationRecipientCount).toBe(sendMock.mock.calls.length)
    expect(refreshed.subscriberNotificationSentAt).toBeTruthy()

    // Re-running must not resend (idempotent).
    ;(payload.sendEmail as unknown as ReturnType<typeof vi.fn>).mockClear()
    await notifySubscribersTask.handler({ input: { postId: post.id }, req: makeReq({}) } as any)
    expect(payload.sendEmail).not.toHaveBeenCalled()
  })
})
