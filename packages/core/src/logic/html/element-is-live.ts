import { isHTMLElement } from './is-html-element'

/**
 * A created element is not always connected to the DOM.
 * It can be connected by appending it to the document.body for instance.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/isConnected
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/utils/live.ts
 */
export function elementIsLive(element: unknown) {
  return isHTMLElement(element) && element.isConnected
}
