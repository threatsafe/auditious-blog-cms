import type { Theme } from './types'

export const themeLocalStorageKey = 'payload-theme'

export const defaultTheme = 'light'

export const getImplicitPreference = (): Theme | null => {
  // Always resolve to the light theme regardless of the OS-level color scheme.
  return 'light'
}
