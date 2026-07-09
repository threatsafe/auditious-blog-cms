import type { GlobalConfig } from 'payload'

import { revalidatePath } from 'next/cache'

import { blogFontOptions } from '@/utilities/blogFont'

// Site-wide content used by custom HTML themes for the sections that are the
// same on every post (newsletter card + call-to-action band).
export const ThemeSettings: GlobalConfig = {
  slug: 'theme-settings',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Site',
  },
  fields: [
    {
      name: 'fontFamily',
      type: 'select',
      admin: {
        description: 'Font used for blog article content.',
      },
      defaultValue: 'default',
      options: blogFontOptions,
    },
    {
      type: 'collapsible',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'newsletterHeading',
          type: 'text',
          admin: {
            description: 'Theme token: {newsletter_heading}',
          },
        },
        {
          name: 'newsletterDescription',
          type: 'textarea',
          admin: {
            description: 'Theme token: {newsletter_description}',
          },
        },
      ],
      label: 'Newsletter card',
    },
    {
      type: 'collapsible',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'ctaHeading',
          type: 'text',
          admin: {
            description: 'Theme token: {cta_heading}',
          },
        },
        {
          name: 'ctaSubheading',
          type: 'textarea',
          admin: {
            description: 'Theme token: {cta_subheading}',
          },
        },
        {
          name: 'ctaButtonLabel',
          type: 'text',
          admin: {
            description: 'Theme token: {cta_button_label}',
          },
        },
        {
          name: 'ctaButtonUrl',
          type: 'text',
          admin: {
            description: 'Theme token: {cta_url}',
          },
        },
      ],
      label: 'Call to action',
    },
  ],
  hooks: {
    afterChange: [
      ({ req }) => {
        if (!req.context.disableRevalidate) {
          revalidatePath('/blogs/[slug]', 'page')
        }
      },
    ],
  },
}
