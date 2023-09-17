export type ValidationOptions = {
  /**
   * Whether to exit immediately upon encountering the first error for the __form__.
   */
  validateAllFieldCriteria?: boolean

  /**
   * Whether to exit immediately upon encountering the first error for a __field__.
   */
  shouldDisplayAllAssociatedErrors?: boolean

  /**
   * Whether to set the custom validity on the input element.
   *
   * i.e. Using the {@link HTMLInputElement.setCustomValidity} API.
   */
  shouldUseNativeValidation?: boolean

  /**
   * Callback to determine if a field is a field array root.
   *
   * Should be handled by a parent FormControl.
   */
  isFieldArrayRoot?: (name: string) => boolean
}
