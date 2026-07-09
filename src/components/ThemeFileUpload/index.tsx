'use client'

import { useField } from '@payloadcms/ui'
import React, { useState } from 'react'

// Custom admin UI control that lets an editor upload a `.html` file and load
// its contents into the sibling `template` code field (the "upload" path).
// Writing/pasting directly into the code field is the "create" path.
const ThemeFileUpload: React.FC = () => {
  const { setValue } = useField<string>({ path: 'template' })
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
          Loaded <strong>{fileName}</strong> into the template below. Review it, then save.
        </p>
      )}
      {error && <p style={{ marginTop: '0.5rem', color: 'var(--theme-error-500)' }}>{error}</p>}
    </div>
  )
}

export default ThemeFileUpload
