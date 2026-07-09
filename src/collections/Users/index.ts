import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    // Author-profile fields surfaced by custom HTML themes (author card).
    {
      name: 'designation',
      type: 'text',
      admin: {
        description: 'Role/title shown in the author card. Theme token: {author_designation}',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'Short author bio. Theme token: {author_bio}',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      admin: {
        description: 'Author photo. Theme token: {author_avatar}',
      },
      relationTo: 'media',
    },
    {
      name: 'socialLinks',
      type: 'array',
      admin: {
        description: 'Repeated in the author card via {social_url} / {social_label}.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
  ],
  timestamps: true,
}
