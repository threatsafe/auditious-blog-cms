/**
 * Escapes a value for safe interpolation into HTML text/attribute contexts.
 * Used for scalar theme placeholders (title, author, date, ...) so that data
 * coming from post fields cannot inject markup into a rendered theme template.
 */
export const escapeHtml = (value: unknown): string => {
  if (value === null || value === undefined) return ''

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
