import { describe, expect, it } from 'vitest'

import { analyzeSeo } from '@/utilities/seoAnalysis'

const lexical = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      children: [{ type: 'text', text }],
    })),
  },
})

describe('analyzeSeo', () => {
  it('marks keyword checks unavailable when no focus keyword is set', () => {
    const result = analyzeSeo({
      seoTitle: 'A perfectly reasonable SEO title here',
      metaDescription: 'x'.repeat(120),
      content: lexical([Array(650).fill('word').join(' ')]),
      hasImage: true,
    })

    expect(result.keywordProvided).toBe(false)
    // No keyword checks should be present.
    expect(result.checks.some((c) => c.id.startsWith('kw-'))).toBe(false)
    // General checks all pass → high score.
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.grade).toBe('good')
  })

  it('scores well when the focus keyword is used everywhere', () => {
    const keyword = 'soc 2 compliance'
    const body = `${keyword} matters. ${Array(600).fill('word').join(' ')} ${keyword} again ${keyword}.`
    const result = analyzeSeo({
      focusKeyword: keyword,
      seoTitle: `${keyword} guide for startups`,
      metaDescription: `Everything about ${keyword} for growing teams and their auditors today.`,
      slug: 'soc-2-compliance-guide',
      content: lexical([`${keyword} is the topic of this opening paragraph about audits.`, body]),
      hasImage: true,
    })

    expect(result.keywordProvided).toBe(true)
    expect(result.checks.find((c) => c.id === 'kw-title')?.status).toBe('good')
    expect(result.checks.find((c) => c.id === 'kw-description')?.status).toBe('good')
    expect(result.checks.find((c) => c.id === 'kw-slug')?.status).toBe('good')
    expect(result.checks.find((c) => c.id === 'kw-content')?.status).toBe('good')
    expect(result.stats.keywordCount).toBeGreaterThanOrEqual(3)
    expect(result.score).toBeGreaterThanOrEqual(70)
  })

  it('flags a missing keyword in content as bad', () => {
    const result = analyzeSeo({
      focusKeyword: 'penetration testing',
      seoTitle: 'A title about something else entirely here',
      metaDescription: 'This description talks about unrelated topics for the reader to enjoy.',
      slug: 'unrelated-post',
      content: lexical(['This body never mentions the target phrase at all, not once.']),
      hasImage: false,
    })

    expect(result.checks.find((c) => c.id === 'kw-content')?.status).toBe('bad')
    expect(result.checks.find((c) => c.id === 'kw-title')?.status).toBe('bad')
    expect(result.grade).not.toBe('good')
  })

  it('extracts text and links from raw HTML content', () => {
    const html = `<h1>Cloud Security</h1><p>Learn about <a href="/internal">cloud security</a> and
      visit <a href="https://example.com">this resource</a>.</p><p>${Array(400)
        .fill('word')
        .join(' ')}</p>`
    const result = analyzeSeo({
      focusKeyword: 'cloud security',
      seoTitle: 'Cloud security fundamentals',
      metaDescription: 'A practical overview of cloud security for engineering teams everywhere.',
      slug: 'cloud-security',
      contentType: 'html',
      htmlContent: html,
      hasImage: true,
    })

    expect(result.stats.internalLinks).toBe(1)
    expect(result.stats.externalLinks).toBe(1)
    expect(result.checks.find((c) => c.id === 'has-links')?.status).toBe('good')
    expect(result.stats.keywordCount).toBeGreaterThanOrEqual(1)
  })
})
