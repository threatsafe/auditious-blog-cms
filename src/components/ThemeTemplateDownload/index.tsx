'use client'

import { useField } from '@payloadcms/ui'
import React, { useState } from 'react'

// Path to the ready-made custom theme served from /public.
const STARTER_TEMPLATE_URL = '/theme-templates/auditious-green.html'

// Turns a theme name into a safe file name, e.g. "My Theme" -> "my-theme".
const toFileName = (name: string): string =>
  (name || 'theme')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'theme'

// Triggers a browser download for an HTML string.
const downloadHtml = (html: string, fileName: string): void => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = fileName.endsWith('.html') ? fileName : `${fileName}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(href)
}

// Admin UI control offering two exports on the theme edit page:
//  • the current `template` field value (so an editor can back up / share it), and
//  • the bundled custom starter template (a styled example to build from).
const ThemeTemplateDownload: React.FC = () => {
  const { value: template } = useField<string>({ path: 'template' })
  const { value: name } = useField<string>({ path: 'name' })
  const [error, setError] = useState<string | null>(null)

  const handleDownloadCurrent = () => {
    setError(null)
    if (!template || !template.trim()) {
      setError('The template is empty — nothing to download yet.')
      return
    }
    downloadHtml(template, toFileName(name))
  }

  const handleDownloadStarter = async () => {
    setError(null)
    try {
      const res = await fetch(STARTER_TEMPLATE_URL)
      if (!res.ok) throw new Error(String(res.status))
      const html = await res.text()
      downloadHtml(html, 'auditious-green-template')
    } catch {
      setError('Could not fetch the starter template.')
    }
  }

  return (
    <div className="field-type" style={{ marginBottom: '1.5rem' }}>
      <label className="field-label">Download template</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button className="btn btn--style-secondary btn--size-small" onClick={handleDownloadCurrent} type="button">
          Download this template (.html)
        </button>
        <button className="btn btn--style-secondary btn--size-small" onClick={handleDownloadStarter} type="button">
          Download starter template
        </button>
      </div>
      <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>
        Export the current template, or grab the styled starter as a base to customize and re-upload.
      </p>
      {error && <p style={{ marginTop: '0.5rem', color: 'var(--theme-error-500)' }}>{error}</p>}
    </div>
  )
}

export default ThemeTemplateDownload
