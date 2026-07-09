import type { CollectionAfterChangeHook } from 'payload'

import type { Post } from '../../../payload-types'

/**
 * Queue a subscriber notification the first time a post transitions into the
 * published state. Guards ensure:
 *   - nothing sends unless the editor opted in (notifySubscribersOnPublish)
 *   - it fires only on the non-published -> published transition (not on edits)
 *   - it never double-sends (subscriberNotificationSentAt already set)
 * Scheduled publishes hit this same path. Actual sending happens in the queued
 * `notifySubscribers` job, keeping the publish request fast.
 */
export const notifySubscribers: CollectionAfterChangeHook<Post> = async ({
  doc,
  previousDoc,
  req,
}) => {
  const becamePublished = previousDoc?._status !== 'published' && doc._status === 'published'

  if (!becamePublished || !doc.notifySubscribersOnPublish || doc.subscriberNotificationSentAt) {
    return doc
  }

  try {
    await req.payload.jobs.queue({
      task: 'notifySubscribers',
      input: { postId: doc.id },
    })
    req.payload.logger.info({ postId: doc.id }, 'Queued subscriber notification')
  } catch (err) {
    req.payload.logger.error({ err, postId: doc.id }, 'Failed to queue subscriber notification')
  }

  return doc
}
