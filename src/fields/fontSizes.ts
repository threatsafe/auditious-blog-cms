// Shared font-size options used by both the editor's Text State control (which
// renders the toolbar dropdown + live styles) and the frontend converters that
// render the selected size on the published post.
export const FONT_SIZE_STATES: Record<string, { css: { 'font-size': string }; label: string }> = {
  sm: { css: { 'font-size': '0.875rem' }, label: 'Small' },
  base: { css: { 'font-size': '1rem' }, label: 'Normal' },
  lg: { css: { 'font-size': '1.25rem' }, label: 'Large' },
  xl: { css: { 'font-size': '1.5rem' }, label: 'Extra large' },
  '2xl': { css: { 'font-size': '2rem' }, label: 'Huge' },
}

// Resolves a serialized text-node font-size state (node.$.fontSize) to a CSS
// font-size value, or undefined when none/unknown.
export const fontSizeFromState = (value?: unknown): string | undefined =>
  typeof value === 'string' && FONT_SIZE_STATES[value]
    ? FONT_SIZE_STATES[value].css['font-size']
    : undefined
