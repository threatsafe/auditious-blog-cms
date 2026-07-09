import type { CollectionConfig } from 'payload'

import { revalidatePath } from 'next/cache'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'

export const Themes: CollectionConfig = {
  slug: 'themes',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'active', 'updatedAt'],
    description:
      'Custom full-page HTML themes for blog posts. Only one theme can be active at a time; the active theme is applied to every post.',
    group: 'Site',
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'active',
      type: 'checkbox',
      admin: {
        description:
          'When enabled, this theme is applied to all blog posts. Enabling it automatically turns off any other active theme.',
        position: 'sidebar',
      },
      defaultValue: false,
    },
    {
      name: 'uploadHtml',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/ThemeFileUpload',
        },
      },
    },
    {
      name: 'downloadTemplate',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/ThemeTemplateDownload',
        },
      },
    },
    {
      name: 'template',
      type: 'code',
      admin: {
        description:
          'Full HTML document for the post page. Placeholders: {{title}}, {{content}}, {{excerpt}}, {{publishedAt}}, {{author}}, {{heroImage}}, {{categories}}, {{slug}}, {{url}}, {{siteName}}.',
        language: 'html',
      },
      required: true,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        const { context, payload } = req

        // Enforce a single active theme: turn off every other active theme.
        if (doc.active && !context.disableThemeSync) {
          await payload.update({
            collection: 'themes',
            context: { disableRevalidate: true, disableThemeSync: true },
            data: { active: false },
            overrideAccess: true,
            req,
            where: {
              and: [{ active: { equals: true } }, { id: { not_equals: doc.id } }],
            },
          })
        }

        // The theme is site-wide, so refresh every rendered post page.
        if (!context.disableRevalidate) {
          revalidatePath('/blogs/[slug]', 'page')
        }

        return doc
      },
    ],
    afterDelete: [
      ({ req: { context } }) => {
        if (!context.disableRevalidate) {
          revalidatePath('/blogs/[slug]', 'page')
        }
      },
    ],
  },
}
