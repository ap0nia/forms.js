/**
 * Sets the custom validity message of an input element.
 */
export function setCustomValidity(inputRef: HTMLInputElement, message?: string | boolean): void {
  inputRef.setCustomValidity(typeof message === 'boolean' ? '' : message || '')
  inputRef.reportValidity()
}
