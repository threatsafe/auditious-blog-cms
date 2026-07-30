// Shared emerald color options used by both the editor's Text State control (which
// renders the toolbar dropdown + live styles) and the frontend converters that
// render the selected color on the published post. Values are the Tailwind
// `emerald` scale so the choices match the rest of the site's palette.
export const EMERALD_COLOR_STATES: Record<string, { css: { color: string }; label: string }> = {
  'emerald-50': { css: { color: '#ecfdf5' }, label: 'Emerald 50' },
  'emerald-100': { css: { color: '#d1fae5' }, label: 'Emerald 100' },
  'emerald-200': { css: { color: '#a7f3d0' }, label: 'Emerald 200' },
  'emerald-300': { css: { color: '#6ee7b7' }, label: 'Emerald 300' },
  'emerald-400': { css: { color: '#34d399' }, label: 'Emerald 400' },
  'emerald-500': { css: { color: '#10b981' }, label: 'Emerald 500' },
  'emerald-600': { css: { color: '#059669' }, label: 'Emerald 600' },
  'emerald-700': { css: { color: '#047857' }, label: 'Emerald 700' },
  'emerald-800': { css: { color: '#065f46' }, label: 'Emerald 800' },
  'emerald-900': { css: { color: '#064e3b' }, label: 'Emerald 900' },
}

// Resolves a serialized text-node color state (node.$.color) to a CSS color
// value, or undefined when none/unknown.
export const emeraldColorFromState = (value?: unknown): string | undefined =>
  typeof value === 'string' && EMERALD_COLOR_STATES[value]
    ? EMERALD_COLOR_STATES[value].css.color
    : undefined
