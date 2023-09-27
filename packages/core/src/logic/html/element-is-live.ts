import { isHTMLElement } from './is-html-element'

export function elementIsLive(element: unknown) {
  return isHTMLElement(element) && element.isConnected
}
