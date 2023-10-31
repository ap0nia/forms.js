import type { FormControl } from '../../src/form-control'

/**
 * Causes all properties of the provided form control's state to be tracked.
 */
export function trackAll(formControl: FormControl): void {
  formControl.state.proxy.isDirty
  formControl.state.proxy.isLoading
  formControl.state.proxy.isSubmitted
  formControl.state.proxy.isSubmitSuccessful
  formControl.state.proxy.isSubmitting
  formControl.state.proxy.isValidating
  formControl.state.proxy.isValid
  formControl.state.proxy.disabled
  formControl.state.proxy.submitCount
  formControl.state.proxy.dirtyFields
  formControl.state.proxy.touchedFields
  formControl.state.proxy.defaultValues
  formControl.state.proxy.errors
  formControl.state.proxy.values
}
