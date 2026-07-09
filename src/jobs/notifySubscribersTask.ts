import type { TaskConfig } from 'payload'

import { sendNewPostNotificationEmail } from '../email/mailer'
import { getServerSideURL } from '../utilities/getURL'

const PAGE_SIZE = 100

/**
 * Bulk-notify active subscribers about a newly published post. Queued from the
 * Posts afterChange hook so admin publish stays fast and scheduled publishes go
 * through the same path. Failures are logged per-recipient and do not abort the
 * batch. Recipient count + timestamp are written back to the post on completion.
 */
export const notifySubscribersTask: TaskConfig<'notifySubscribers'> = {
  slug: 'notifySubscribers',
  inputSchema: [{ name: 'postId', type: 'number', required: true }],
  outputSchema: [{ name: 'recipientCount', type: 'number' }],
  handler: async ({ input, req }) => {
    const { payload } = req
    const postId = input.postId

    const post = await payload.findByID({
      collection: 'posts',
      id: postId,
      depth: 0,
      overrideAccess: true,
      disableErrors: true,
    })

    // Idempotency guard: never send twice for the same post.
    if (!post || post.subscriberNotificationSentAt) {
      return { output: { recipientCount: post?.subscriberNotificationRecipientCount ?? 0 } }
    }

    const postData = {
      title: post.title,
      url: `${getServerSideURL()}/blogs/${post.slug}`,
      excerpt: post.meta?.description ?? null,
    }

    let page = 1
    let sent = 0
    let hasNextPage = true

    while (hasNextPage) {
      const batch = await payload.find({
        collection: 'subscribers',
        where: { status: { equals: 'active' } },
        limit: PAGE_SIZE,
        page,
        depth: 0,
        overrideAccess: true,
      })

      for (const subscriber of batch.docs) {
        try {
          await sendNewPostNotificationEmail(payload, { subscriber, post: postData })
          sent += 1
        } catch (err) {
          payload.logger.error(
            { err, subscriberId: subscriber.id, postId },
            'Failed to send new-post notification',
          )
        }
      }

      hasNextPage = batch.hasNextPage
      page += 1
    }

    await payload.update({
      collection: 'posts',
      id: postId,
      data: {
        subscriberNotificationSentAt: new Date().toISOString(),
        subscriberNotificationRecipientCount: sent,
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    })

    payload.logger.info({ postId, recipientCount: sent }, 'Subscriber notification batch complete')
    return { output: { recipientCount: sent } }
  },
}
