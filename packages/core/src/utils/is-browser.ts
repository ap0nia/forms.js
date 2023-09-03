export const isBrowser =
  typeof window !== 'undefined' &&
  typeof window.HTMLElement !== 'undefined' &&
  typeof document !== 'undefined'
