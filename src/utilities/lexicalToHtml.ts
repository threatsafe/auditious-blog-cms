/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  convertLexicalToHTMLAsync,
  type HTMLConvertersFunctionAsync,
} from '@payloadcms/richtext-lexical/html-async'

import { fontSizeFromState } from '@/fields/fontSizes'
import { escapeHtml } from './escapeHtml'

// Renders a CTA link node to an <a> tag, resolving internal references to URLs.
const renderCtaLink = (link: any): string => {
  if (!link) return ''

  let href = '#'
  if (link.type === 'custom' && link.url) {
    href = link.url
  } else if (link.type === 'reference' && link.reference) {
    const relationTo = link.reference.relationTo
    const doc = typeof link.reference.value === 'object' ? link.reference.value : null
    const slug = doc?.slug
    if (slug) href = relationTo === 'posts' ? `/blogs/${slug}` : `/${slug}`
  }

  const label = escapeHtml(link.label || 'Learn more')
  const target = link.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
  const appearance = link.appearance ? ` content-cta__link--${escapeHtml(link.appearance)}` : ''

  return `<a class="content-cta__link${appearance}" href="${escapeHtml(href)}"${target}>${label}</a>`
}

// Builds the HTML converters used to turn Lexical post content into an HTML
// string. Extends the default converters with the custom blocks that can be
// embedded in post content (banner, code, mediaBlock) plus cta for reuse.
const buildConverters = (): HTMLConvertersFunctionAsync => {
  const converters: HTMLConvertersFunctionAsync = ({ defaultConverters }) => ({
    ...defaultConverters,
    // Render the font-size chosen in the editor (stored as a text-node state).
    text: async (args: any) => {
      const convert = defaultConverters.text as ((a: any) => Promise<string> | string) | undefined
      const base = convert ? await convert(args) : escapeHtml(args.node.text)
      const fontSize = fontSizeFromState(args.node?.$?.fontSize)
      return fontSize ? `<span style="font-size:${fontSize}">${base}</span>` : base
    },
    blocks: {
      banner: async ({ node }: any) => {
        const inner = await convertLexicalToHTMLAsync({
          converters,
          data: node.fields.content,
          disableContainer: true,
        })
        return `<div class="content-banner content-banner--${escapeHtml(node.fields.style)}">${inner}</div>`
      },
      code: ({ node }: any) => {
        const language = escapeHtml(node.fields.language || '')
        return `<pre class="content-code language-${language}"><code>${escapeHtml(node.fields.code)}</code></pre>`
      },
      cta: async ({ node }: any) => {
        const inner = node.fields.richText
          ? await convertLexicalToHTMLAsync({
              converters,
              data: node.fields.richText,
              disableContainer: true,
            })
          : ''
        const links = Array.isArray(node.fields.links)
          ? node.fields.links.map((item: any) => renderCtaLink(item?.link)).join('')
          : ''
        return `<div class="content-cta">${inner}<div class="content-cta__links">${links}</div></div>`
      },
      mediaBlock: ({ node }: any) => {
        const media = node.fields.media
        if (media && typeof media === 'object' && media.url) {
          const alt = escapeHtml(media.alt || '')
          return `<figure class="content-media"><img alt="${alt}" src="${escapeHtml(media.url)}" /></figure>`
        }
        return ''
      },
    },
  })

  return converters
}

/**
 * Converts a post's Lexical `content` field to an HTML string for use in the
 * `{{content}}` theme placeholder. Returns an empty string on any failure so a
 * malformed body never breaks the whole themed page.
 */
export const convertContentToHtml = async (content: any): Promise<string> => {
  if (!content) return ''

  try {
    return await convertLexicalToHTMLAsync({
      converters: buildConverters(),
      data: content,
      disableContainer: true,
    })
  } catch {
    return ''
  }
}
