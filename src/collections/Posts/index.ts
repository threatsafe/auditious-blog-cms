import type { CollectionConfig } from 'payload'

import type { Post } from '../../payload-types'

import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  OrderedListFeature,
  TextStateFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { FONT_SIZE_STATES } from '../../fields/fontSizes'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { notifySubscribers } from './hooks/notifySubscribers'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

import { seoControlFields } from '../../fields/seoControls'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'posts',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'posts',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'contentType',
              type: 'radio',
              admin: {
                description:
                  'Choose how to author the post body: the rich text editor, or raw HTML (paste or upload an .html file).',
                layout: 'horizontal',
              },
              defaultValue: 'richText',
              options: [
                { label: 'Rich Text Editor', value: 'richText' },
                { label: 'HTML', value: 'html' },
              ],
            },
            {
              name: 'content',
              type: 'richText',
              admin: {
                condition: (_, siblingData) => siblingData?.contentType !== 'html',
              },
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),

                    UnorderedListFeature(),
                    OrderedListFeature(),
                    // Tables whose cells accept the editor's other features
                    // (text, images/uploads, lists, etc.).
                    EXPERIMENTAL_TableFeature(),
                    TextStateFeature({ state: { fontSize: FONT_SIZE_STATES } }),
                  ]
                },
              }),
              label: false,
              validate: (value: unknown, { siblingData }: { siblingData: Partial<Post> }) => {
                if (siblingData?.contentType !== 'html' && !value) {
                  return 'Content is required.'
                }
                return true
              },
            },
            {
              name: 'htmlContentUpload',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/HtmlContentUpload',
                },
                condition: (_, siblingData) => siblingData?.contentType === 'html',
              },
            },
            {
              name: 'htmlContent',
              type: 'code',
              admin: {
                condition: (_, siblingData) => siblingData?.contentType === 'html',
                description:
                  'Raw HTML for the post body. Upload an .html file above or paste/edit the HTML here.',
                language: 'html',
              },
              label: 'HTML content',
              validate: (value: unknown, { siblingData }: { siblingData: Partial<Post> }) => {
                if (siblingData?.contentType === 'html' && !value) {
                  return 'HTML content is required when Content type is set to HTML.'
                }
                return true
              },
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
          ],
          label: 'Meta',
        },
        {
          fields: [
            {
              name: 'faqs',
              type: 'array',
              admin: {
                description:
                  'Rendered by custom HTML themes in the FAQ section via {question} / {answer}.',
              },
              fields: [
                {
                  name: 'question',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'answer',
                  type: 'textarea',
                  required: true,
                },
              ],
              labels: {
                plural: 'FAQs',
                singular: 'FAQ',
              },
            },
          ],
          label: 'FAQs',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
            ...seoControlFields,
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'notifySubscribersOnPublish',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Email active newsletter subscribers when this post is first published. Sends only once, on the initial publish.',
        position: 'sidebar',
      },
    },
    {
      name: 'subscriberNotificationSentAt',
      type: 'date',
      admin: {
        description: 'When the publish notification batch was sent.',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'subscriberNotificationRecipientCount',
      type: 'number',
      admin: {
        description: 'Number of subscribers emailed for this post.',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePost, notifySubscribers],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
