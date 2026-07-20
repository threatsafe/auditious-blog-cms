import React from 'react'

/**
 * Renders a <script type="application/ld+json"> block. `<` is escaped to its
 * unicode form so structured data containing "</script>" (e.g. inside a
 * description) cannot break out of the script tag.
 */
export const JsonLd: React.FC<{ data: unknown }> = ({ data }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
  />
)
