import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { subscriberEndpoints } from './endpoints'

// Newsletter subscribers. A double opt-in state machine:
//   pending -> active (via confirmation link) -> unsubscribed (via unsubscribe link)
// Public signup goes through the custom /subscribe endpoint (see endpoints.ts),
// which generates tokens and sends mail with overrideAccess. Direct creates are
// therefore restricted to authenticated admins.
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['email', 'status', 'createdAt'],
    group: 'Site',
    useAsTitle: 'email',
  },
  endpoints: subscriberEndpoints,
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      options: [
        { label: 'Pending confirmation', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Unsubscribed', value: 'unsubscribed' },
      ],
    },
    // Lifecycle timestamps — all managed by the endpoints/hooks, read-only in admin.
    {
      name: 'subscribedAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'confirmedAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'unsubscribedAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'lastEmailSentAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    // Confirmation token: only the hash is stored; cleared once confirmed.
    // The unsubscribe token is stateless (HMAC over the id) so it is NOT stored.
    {
      name: 'confirmationTokenHash',
      type: 'text',
      index: true,
      admin: { hidden: true },
    },
    {
      name: 'confirmationTokenExpiresAt',
      type: 'date',
      admin: { hidden: true },
    },
  ],
  timestamps: true,
}
