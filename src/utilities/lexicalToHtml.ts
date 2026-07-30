/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  convertLexicalToHTMLAsync,
  type HTMLConvertersFunctionAsync,
} from '@payloadcms/richtext-lexical/html-async'

import { fontSizeFromState } from '@/fields/fontSizes'
import { emeraldColorFromState } from '@/fields/emeraldColors'
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

// Cell background choices → inline CSS, mirroring the React component's classes
// so the HTML themes render tables the same way as the site frontend.
const TABLE_CELL_BACKGROUND_CSS: Record<string, string> = {
  'emerald-soft': 'background-color:#ecfdf5;',
  'emerald-solid': 'background-color:#059669;color:#ffffff;',
  muted: 'background-color:#f1f5f9;',
}

// Renders a structured Table block to a self-contained HTML string (inline
// styles so it looks right even without theme CSS).
const renderTableBlock = (fields: any): string => {
  const rows: any[] = Array.isArray(fields?.rows) ? fields.rows : []
  if (rows.length === 0) return ''

  const headerRow = fields?.headerRow !== false
  const headerColumn = Boolean(fields?.headerColumn)
  const striped = fields?.striped !== false

  const renderCell = (cell: any, cellIndex: number, isHeaderRow: boolean): string => {
    const isHeaderColumnCell = headerColumn && cellIndex === 0
    const isHeader = isHeaderRow || isHeaderColumnCell
    const tag = isHeader ? 'th' : 'td'
    const scope = isHeaderRow ? ' scope="col"' : isHeaderColumnCell ? ' scope="row"' : ''
    const align = ['left', 'center', 'right'].includes(cell?.align) ? cell.align : 'left'
    const colSpan = Number(cell?.colSpan) > 1 ? ` colspan="${Number(cell.colSpan)}"` : ''
    const rowSpan = Number(cell?.rowSpan) > 1 ? ` rowspan="${Number(cell.rowSpan)}"` : ''
    let style = `border:1px solid #e2e8f0;padding:8px 16px;vertical-align:top;text-align:${align};white-space:pre-line;`
    if (isHeader) style += 'font-weight:600;'
    style += TABLE_CELL_BACKGROUND_CSS[cell?.background] || ''
    return `<${tag}${scope}${colSpan}${rowSpan} style="${style}">${escapeHtml(cell?.content || '')}</${tag}>`
  }

  const renderRow = (row: any, bodyIndex: number, isHeaderRow: boolean): string => {
    const cells: any[] = Array.isArray(row?.cells) ? row.cells : []
    const stripe =
      !isHeaderRow && striped && bodyIndex % 2 === 1 ? ' style="background-color:#f8fafc;"' : ''
    return `<tr${stripe}>${cells.map((c, i) => renderCell(c, i, isHeaderRow)).join('')}</tr>`
  }

  const head = headerRow ? rows[0] : null
  const body = headerRow ? rows.slice(1) : rows
  const caption = fields?.caption
    ? `<caption style="caption-side:bottom;padding-top:8px;text-align:left;font-size:0.875rem;color:#64748b;">${escapeHtml(fields.caption)}</caption>`
    : ''
  const thead = head ? `<thead>${renderRow(head, 0, true)}</thead>` : ''
  const tbody = `<tbody>${body.map((r, i) => renderRow(r, i, false)).join('')}</tbody>`

  return `<div class="content-table-wrap" style="overflow-x:auto;margin:2rem 0;"><table class="content-table" style="border-collapse:collapse;width:100%;font-size:0.95rem;">${caption}${thead}${tbody}</table></div>`
}

// Builds the HTML converters used to turn Lexical post content into an HTML
// string. Extends the default converters with the custom blocks that can be
// embedded in post content (banner, code, mediaBlock, table) plus cta for reuse.
const buildConverters = (): HTMLConvertersFunctionAsync => {
  const converters: HTMLConvertersFunctionAsync = ({ defaultConverters }) => ({
    ...defaultConverters,
    // Render the font-size chosen in the editor (stored as a text-node state).
    text: async (args: any) => {
      const convert = defaultConverters.text as ((a: any) => Promise<string> | string) | undefined
      const base = convert ? await convert(args) : escapeHtml(args.node.text)
      const fontSize = fontSizeFromState(args.node?.$?.fontSize)
      const color = emeraldColorFromState(args.node?.$?.color)
      const style = [fontSize ? `font-size:${fontSize}` : '', color ? `color:${color}` : '']
        .filter(Boolean)
        .join(';')
      return style ? `<span style="${style}">${base}</span>` : base
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
      table: ({ node }: any) => renderTableBlock(node.fields),
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
