import { isHTMLElement } from '../lib/is-html-element'
import type { Ref } from '../types/fields'

export function isLive(ref: Ref) {
  return isHTMLElement(ref) && ref.isConnected
}
