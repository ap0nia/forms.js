import { isBrowser } from './is-browser'

export function isHTMLElement(value: unknown): value is HTMLElement {
  if (!isBrowser) {
    return false
  }

  const owner = value ? ((value as HTMLElement).ownerDocument as Document) : 0

  return value instanceof (owner && owner.defaultView ? owner.defaultView.HTMLElement : HTMLElement)
}
