// Font-family options for blog article content. `stack` is the CSS
// font-family value; `googleHref` (when present) is the stylesheet to load.
export const BLOG_FONTS: Record<string, { googleHref?: string; label: string; stack: string }> = {
  default: { label: 'Default (Geist Sans)', stack: '' },
  georgia: { label: 'Georgia (Serif)', stack: 'Georgia, "Times New Roman", serif' },
  inter: {
    googleHref: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    label: 'Inter',
    stack: '"Inter", sans-serif',
  },
  lora: {
    googleHref: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
    label: 'Lora (Serif)',
    stack: '"Lora", Georgia, serif',
  },
  merriweather: {
    googleHref: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
    label: 'Merriweather (Serif)',
    stack: '"Merriweather", Georgia, serif',
  },
  system: {
    label: 'System UI',
    stack: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
}

export const getBlogFont = (value?: null | string) => BLOG_FONTS[value || 'default'] || BLOG_FONTS.default

// Admin select options derived from the same source of truth.
export const blogFontOptions = Object.entries(BLOG_FONTS).map(([value, { label }]) => ({
  label,
  value,
}))
