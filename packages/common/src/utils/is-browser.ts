export function getIsBrowser() {
  return (
    typeof window !== 'undefined' &&
    typeof window.HTMLElement !== 'undefined' &&
    typeof document !== 'undefined'
  )
}

export const isBrowser = getIsBrowser()
