import { isBrowser } from '@hookform/common/utils/is-browser'

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/utils/isHTMLElement.ts
 */
export function isHTMLElement(value: unknown): value is HTMLElement {
  if (!isBrowser) {
    return false
  }

  const owner = value ? ((value as HTMLElement).ownerDocument as Document) : 0

  return value instanceof (owner && owner.defaultView ? owner.defaultView.HTMLElement : HTMLElement)
}
