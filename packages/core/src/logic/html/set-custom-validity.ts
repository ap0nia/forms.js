/**
 * Sets the custom validity message of an input element.
 */
export function setCustomValidity(element: HTMLInputElement, message?: string | boolean): void {
  element.setCustomValidity(typeof message === 'boolean' ? '' : message || '')
  element.reportValidity()
}
