export function isBrowser() {
  return (
    typeof window !== 'undefined' &&
    typeof window.HTMLElement !== 'undefined' &&
    typeof document !== 'undefined'
  )
}
