import type { FieldElement } from '../types'

import { isHTMLElement } from './is-html-element'

export function isLive(ref: FieldElement) {
  return isHTMLElement(ref) && ref.isConnected
}
