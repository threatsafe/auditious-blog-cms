/**
 * RankMath-style content analysis for Posts.
 *
 * Pure, framework-free logic so it can be unit tested and reused. The admin
 * panel (`@/components/SeoAnalysis`) feeds it live form data; it returns a
 * 0–100 score plus a list of pass/warn/fail checks.
 */

export type SeoCheckStatus = 'good' | 'warn' | 'bad'

export interface SeoCheck {
  id: string
  label: string
  status: SeoCheckStatus
  message: string
  /** Relative weight in the overall score. */
  weight: number
}

export interface SeoAnalysisResult {
  /** 0–100. */
  score: number
  grade: 'bad' | 'good' | 'ok'
  keywordProvided: boolean
  checks: SeoCheck[]
  stats: {
    wordCount: number
    /** Keyword density as a percentage of total words. */
    density: number
    keywordCount: number
    internalLinks: number
    externalLinks: number
  }
}

/** Raw form data pulled straight from the Posts editor. */
export interface SeoAnalysisInput {
  focusKeyword?: null | string
  seoTitle?: null | string
  metaDescription?: null | string
  slug?: null | string
  /** Post `title` — used as a fallback when the SEO title is blank. */
  title?: null | string
  contentType?: null | string
  /** Lexical richText value (`{ root: {...} }`). */
  content?: unknown
  htmlContent?: null | string
  hasImage?: boolean
}

interface ExtractedContent {
  text: string
  firstParagraph: string
  internalLinks: number
  externalLinks: number
}

const WORD_RE = /[\p{L}\p{N}'’-]+/gu

const normalize = (value?: null | string): string => (value || '').toLowerCase().trim()

const countWords = (text: string): number => (text.match(WORD_RE) || []).length

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Count non-overlapping occurrences of `keyword` (case-insensitive) in `text`. */
const countOccurrences = (text: string, keyword: string): number => {
  const needle = normalize(keyword)
  if (!needle) return 0
  const re = new RegExp(escapeRegExp(needle), 'g')
  return (normalize(text).match(re) || []).length
}

const classifyLink = (href: string): 'external' | 'internal' | null => {
  const value = (href || '').trim()
  if (!value) return null
  if (/^(mailto:|tel:|javascript:)/i.test(value)) return null
  if (/^https?:\/\//i.test(value)) return 'external'
  // Relative paths, anchors, and root-relative links are internal.
  if (value.startsWith('/') || value.startsWith('#') || value.startsWith('.')) return 'internal'
  return 'internal'
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const extractFromLexical = (root: any): ExtractedContent => {
  const paragraphs: string[] = []
  let internalLinks = 0
  let externalLinks = 0

  const walk = (node: any, buffer: string[]): void => {
    if (!node) return

    if (typeof node.text === 'string') {
      buffer.push(node.text)
    }

    if (node.type === 'link' || node.type === 'autolink') {
      // Internal links reference another doc; external links carry a URL.
      if (node.fields?.linkType === 'internal' || node.fields?.doc) {
        internalLinks += 1
      } else {
        const kind = classifyLink(node.fields?.url || '')
        if (kind === 'external') externalLinks += 1
        else if (kind === 'internal') internalLinks += 1
      }
    }

    if (Array.isArray(node.children)) {
      // Treat top-level paragraph/heading/list nodes as paragraph boundaries.
      const isBlock = ['paragraph', 'heading', 'listitem', 'list', 'quote'].includes(node.type)
      if (isBlock) {
        const local: string[] = []
        node.children.forEach((child: any) => walk(child, local))
        const joined = local.join('').trim()
        if (joined) paragraphs.push(joined)
      } else {
        node.children.forEach((child: any) => walk(child, buffer))
      }
    }
  }

  const topBuffer: string[] = []
  walk(root, topBuffer)
  // Any stray inline text captured at the very top level.
  const stray = topBuffer.join('').trim()
  if (stray) paragraphs.unshift(stray)

  return {
    text: paragraphs.join('\n\n'),
    firstParagraph: paragraphs[0] || '',
    internalLinks,
    externalLinks,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const extractFromHtml = (html: string): ExtractedContent => {
  let internalLinks = 0
  let externalLinks = 0

  const anchorRe = /<a\b[^>]*href=["']([^"']*)["'][^>]*>/gi
  let match: null | RegExpExecArray
  while ((match = anchorRe.exec(html)) !== null) {
    const kind = classifyLink(match[1])
    if (kind === 'external') externalLinks += 1
    else if (kind === 'internal') internalLinks += 1
  }

  // Drop scripts/styles, then strip tags. Split paragraphs on block-level tags.
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  const blockSplit = withoutScripts.replace(/<\/(p|div|h[1-6]|li|section|article|br)\s*>/gi, '\n')
  const text = blockSplit
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
  const paragraphs = text
    .split('\n')
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  return {
    text: paragraphs.join('\n\n'),
    firstParagraph: paragraphs[0] || '',
    internalLinks,
    externalLinks,
  }
}

const extractContent = (input: SeoAnalysisInput): ExtractedContent => {
  if (input.contentType === 'html') {
    return extractFromHtml(input.htmlContent || '')
  }
  const root = (input.content as { root?: unknown })?.root
  if (root) return extractFromLexical(root)
  return { text: '', firstParagraph: '', internalLinks: 0, externalLinks: 0 }
}

const gradeFromScore = (score: number): SeoAnalysisResult['grade'] => {
  if (score >= 80) return 'good'
  if (score >= 50) return 'ok'
  return 'bad'
}

/**
 * Run the full analysis. When no focus keyword is set, keyword-specific checks
 * are skipped and the score reflects the general (length/image/links) checks.
 */
export const analyzeSeo = (input: SeoAnalysisInput): SeoAnalysisResult => {
  const keyword = normalize(input.focusKeyword)
  const keywordProvided = keyword.length > 0
  const seoTitle = (input.seoTitle || input.title || '').trim()
  const metaDescription = (input.metaDescription || '').trim()
  const slug = normalize(input.slug)

  const extracted = extractContent(input)
  const wordCount = countWords(extracted.text)
  const keywordCount = keywordProvided ? countOccurrences(extracted.text, keyword) : 0
  const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0

  const checks: SeoCheck[] = []

  if (keywordProvided) {
    // --- Keyword-driven checks ---
    const titleLower = seoTitle.toLowerCase()
    const inTitle = titleLower.includes(keyword)
    checks.push({
      id: 'kw-title',
      label: 'Focus keyword in SEO title',
      status: inTitle ? 'good' : 'bad',
      weight: 3,
      message: inTitle
        ? 'The focus keyword appears in the SEO title.'
        : 'Add the focus keyword to the SEO title.',
    })

    const firstHalf = titleLower.slice(0, Math.max(1, Math.ceil(titleLower.length / 2)))
    const nearStart = firstHalf.includes(keyword)
    checks.push({
      id: 'kw-title-start',
      label: 'Focus keyword near the start of the title',
      status: inTitle ? (nearStart ? 'good' : 'warn') : 'warn',
      weight: 1,
      message: nearStart
        ? 'The focus keyword is near the beginning of the title.'
        : 'Move the focus keyword closer to the start of the title.',
    })

    const inDescription = metaDescription.toLowerCase().includes(keyword)
    checks.push({
      id: 'kw-description',
      label: 'Focus keyword in meta description',
      status: inDescription ? 'good' : 'bad',
      weight: 2,
      message: inDescription
        ? 'The focus keyword appears in the meta description.'
        : 'Add the focus keyword to the meta description.',
    })

    const inSlug = slug.includes(keyword.replace(/\s+/g, '-')) || slug.includes(keyword)
    checks.push({
      id: 'kw-slug',
      label: 'Focus keyword in URL slug',
      status: inSlug ? 'good' : 'warn',
      weight: 1,
      message: inSlug
        ? 'The focus keyword appears in the URL slug.'
        : 'Consider adding the focus keyword to the URL slug.',
    })

    const inFirstParagraph = extracted.firstParagraph.toLowerCase().includes(keyword)
    checks.push({
      id: 'kw-first-paragraph',
      label: 'Focus keyword in the opening paragraph',
      status: inFirstParagraph ? 'good' : 'warn',
      weight: 2,
      message: inFirstParagraph
        ? 'The focus keyword appears early in the content.'
        : 'Mention the focus keyword in the first paragraph.',
    })

    checks.push({
      id: 'kw-content',
      label: 'Focus keyword used in the content',
      status: keywordCount > 0 ? 'good' : 'bad',
      weight: 3,
      message:
        keywordCount > 0
          ? `The focus keyword appears ${keywordCount} time${keywordCount === 1 ? '' : 's'}.`
          : 'The focus keyword does not appear in the content.',
    })

    let densityStatus: SeoCheckStatus = 'bad'
    if (density >= 0.5 && density <= 2.5) densityStatus = 'good'
    else if (density > 0 && density < 3.5) densityStatus = 'warn'
    checks.push({
      id: 'kw-density',
      label: 'Keyword density (0.5%–2.5%)',
      status: densityStatus,
      weight: 2,
      message:
        wordCount === 0
          ? 'Add content to measure keyword density.'
          : `Keyword density is ${density.toFixed(2)}%.`,
    })
  }

  // --- General checks (always evaluated) ---
  const titleLen = seoTitle.length
  let titleStatus: SeoCheckStatus = 'bad'
  if (titleLen >= 15 && titleLen <= 60) titleStatus = 'good'
  else if (titleLen > 0) titleStatus = 'warn'
  checks.push({
    id: 'title-length',
    label: 'SEO title length (15–60 characters)',
    status: titleStatus,
    weight: 2,
    message: titleLen === 0 ? 'Set an SEO title.' : `SEO title is ${titleLen} characters.`,
  })

  const descLen = metaDescription.length
  let descStatus: SeoCheckStatus = 'bad'
  if (descLen >= 50 && descLen <= 160) descStatus = 'good'
  else if (descLen > 0) descStatus = 'warn'
  checks.push({
    id: 'description-length',
    label: 'Meta description length (50–160 characters)',
    status: descStatus,
    weight: 2,
    message:
      descLen === 0 ? 'Write a meta description.' : `Meta description is ${descLen} characters.`,
  })

  let contentStatus: SeoCheckStatus = 'bad'
  if (wordCount >= 600) contentStatus = 'good'
  else if (wordCount >= 300) contentStatus = 'warn'
  checks.push({
    id: 'content-length',
    label: 'Content length (600+ words)',
    status: contentStatus,
    weight: 3,
    message: `The content has ${wordCount} word${wordCount === 1 ? '' : 's'}.`,
  })

  checks.push({
    id: 'has-image',
    label: 'At least one image',
    status: input.hasImage ? 'good' : 'warn',
    weight: 1,
    message: input.hasImage
      ? 'The post has a hero/thumbnail image.'
      : 'Add a hero or thumbnail image.',
  })

  const totalLinks = extracted.internalLinks + extracted.externalLinks
  checks.push({
    id: 'has-links',
    label: 'Links in content',
    status: totalLinks > 0 ? 'good' : 'warn',
    weight: 1,
    message:
      totalLinks > 0
        ? `${extracted.internalLinks} internal, ${extracted.externalLinks} external link${totalLinks === 1 ? '' : 's'}.`
        : 'Add internal or external links to the content.',
  })

  // --- Scoring ---
  const statusPoints: Record<SeoCheckStatus, number> = { good: 1, warn: 0.5, bad: 0 }
  const earned = checks.reduce((sum, c) => sum + statusPoints[c.status] * c.weight, 0)
  const possible = checks.reduce((sum, c) => sum + c.weight, 0)
  const score = possible > 0 ? Math.round((earned / possible) * 100) : 0

  return {
    score,
    grade: gradeFromScore(score),
    keywordProvided,
    checks,
    stats: {
      wordCount,
      density,
      keywordCount,
      internalLinks: extracted.internalLinks,
      externalLinks: extracted.externalLinks,
    },
  }
}
