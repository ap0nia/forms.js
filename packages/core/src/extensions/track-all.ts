import type { FormControl } from '../../src/form-control'

/**
 * Causes all properties of the provided form control's state to be tracked.
 */
export function trackAll(formControl: FormControl): void {
  formControl.batchedState.proxy.isDirty
  formControl.batchedState.proxy.isLoading
  formControl.batchedState.proxy.isSubmitted
  formControl.batchedState.proxy.isSubmitSuccessful
  formControl.batchedState.proxy.isSubmitting
  formControl.batchedState.proxy.isValidating
  formControl.batchedState.proxy.isValid
  formControl.batchedState.proxy.disabled
  formControl.batchedState.proxy.submitCount
  formControl.batchedState.proxy.dirtyFields
  formControl.batchedState.proxy.touchedFields
  formControl.batchedState.proxy.defaultValues
  formControl.batchedState.proxy.errors
  formControl.batchedState.proxy.values
}
