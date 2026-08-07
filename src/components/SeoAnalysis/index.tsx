'use client'

import { useAllFormFields } from '@payloadcms/ui'
import React, { useMemo } from 'react'

import { analyzeSeo, type SeoAnalysisInput, type SeoCheckStatus } from '@/utilities/seoAnalysis'

// RankMath-style live SEO analysis panel. Reads sibling form fields (focus
// keyword, SEO title/description, slug, body content, images) and renders a
// 0–100 score with a pass/warn/fail checklist that updates as you type.

const STATUS_COLOR: Record<SeoCheckStatus, string> = {
  good: '#15803d',
  warn: '#b45309',
  bad: '#b91c1c',
}

const STATUS_SYMBOL: Record<SeoCheckStatus, string> = {
  good: '✓',
  warn: '!',
  bad: '✕',
}

const gradeColor = (grade: 'bad' | 'good' | 'ok'): string =>
  grade === 'good' ? '#15803d' : grade === 'ok' ? '#b45309' : '#b91c1c'

const gradeLabel = (grade: 'bad' | 'good' | 'ok'): string =>
  grade === 'good' ? 'Good' : grade === 'ok' ? 'Needs work' : 'Poor'

const asString = (value: unknown): string => (typeof value === 'string' ? value : '')

const SeoAnalysis: React.FC = () => {
  const [fields] = useAllFormFields()

  const result = useMemo(() => {
    const get = (path: string): unknown => fields?.[path]?.value

    const input: SeoAnalysisInput = {
      focusKeyword: asString(get('meta.focusKeyword')),
      seoTitle: asString(get('meta.title')),
      metaDescription: asString(get('meta.description')),
      slug: asString(get('slug')),
      title: asString(get('title')),
      contentType: asString(get('contentType')),
      content: get('content'),
      htmlContent: asString(get('htmlContent')),
      hasImage: Boolean(get('heroImage') || get('thumbnail') || get('meta.image')),
    }

    return analyzeSeo(input)
  }, [fields])

  return (
    <div className="field-type" style={{ marginBottom: '1.5rem' }}>
      <label className="field-label">SEO Analysis</label>

      <div
        style={{
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '16px 20px',
            borderBottom: '1px solid var(--theme-elevation-150)',
          }}
        >
          <div
            aria-hidden
            style={{
              flexShrink: 0,
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 20,
              fontWeight: 700,
              background: gradeColor(result.grade),
            }}
          >
            {result.score}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: gradeColor(result.grade) }}>
              {gradeLabel(result.grade)} · {result.score}/100
            </div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>
              {result.keywordProvided
                ? `${result.stats.wordCount} words · keyword used ${result.stats.keywordCount}× · density ${result.stats.density.toFixed(2)}%`
                : 'Set a focus keyword above to unlock keyword checks.'}
            </div>
          </div>
        </div>

        <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
          {result.checks.map((check) => (
            <li
              key={check.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '8px 20px',
              }}
            >
              <span
                aria-hidden
                style={{
                  flexShrink: 0,
                  marginTop: 1,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#fff',
                  background: STATUS_COLOR[check.status],
                }}
              >
                {STATUS_SYMBOL[check.status]}
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.4 }}>
                <strong style={{ fontWeight: 600 }}>{check.label}</strong>
                <span style={{ display: 'block', opacity: 0.8 }}>{check.message}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default SeoAnalysis
