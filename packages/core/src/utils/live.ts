import { isHTMLElement } from '../guards/is-html-element';

export function live (ref: unknown) {
  return isHTMLElement(ref) && ref.isConnected;
}
