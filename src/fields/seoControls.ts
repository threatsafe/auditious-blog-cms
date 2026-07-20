import type { Field } from 'payload'

/**
 * Extra SEO controls appended to the plugin-seo `meta` group on Posts and Pages
 * (RankMath-style per-document robots + canonical override). Read back out in
 * `generateMeta` to emit <meta name="robots"> and the canonical link.
 */
export const seoControlFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'noindex',
        type: 'checkbox',
        label: 'Discourage search engines (noindex)',
        admin: { width: '50%' },
      },
      {
        name: 'nofollow',
        type: 'checkbox',
        label: 'Nofollow all links (nofollow)',
        admin: { width: '50%' },
      },
    ],
  },
  {
    name: 'canonicalURL',
    type: 'text',
    label: 'Canonical URL',
    admin: {
      description:
        'Optional. Overrides the canonical URL for this page. Leave blank to use the default page URL.',
    },
  },
]
