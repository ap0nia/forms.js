/**
 * Sets the custom validity message of an input element.
 *
 * Relocated from inside a function closure to a general purpose helper function.
 *
 * @see https://github.com/react-hook-form/react-hook-form/blob/1d0503b46cfe0589b188c4c0d9fa75f247271cf7/src/logic/validateField.ts#L60
 */
export function setCustomValidity(element: HTMLInputElement, message?: string | boolean): void {
  element.setCustomValidity(typeof message === 'boolean' ? '' : message || '')
  element.reportValidity()
}
