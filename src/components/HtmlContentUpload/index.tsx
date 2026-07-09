'use client'

import { useField } from '@payloadcms/ui'
import React, { useState } from 'react'

// Admin control that loads an uploaded `.html` file into the sibling
// `htmlContent` code field. Pasting/typing into that field is also supported.
const HtmlContentUpload: React.FC = () => {
  const { setValue } = useField<string>({ path: 'htmlContent' })
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      setValue(text)
      setFileName(file.name)
    } catch {
      setError('Could not read the selected file.')
    }
  }

  return (
    <div className="field-type" style={{ marginBottom: '1.5rem' }}>
      <label className="field-label">Upload HTML file</label>
      <input accept=".html,.htm,text/html" onChange={handleChange} type="file" />
      {fileName && (
        <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>
          Loaded <strong>{fileName}</strong> into the HTML content below. Review it, then save.
        </p>
      )}
      {error && <p style={{ marginTop: '0.5rem', color: 'var(--theme-error-500)' }}>{error}</p>}
    </div>
  )
}

export default HtmlContentUpload
