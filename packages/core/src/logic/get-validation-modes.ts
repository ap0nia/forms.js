import { VALIDATION_MODE, type ValidationMode } from '../constants'

export function getValidationModes(mode?: keyof ValidationMode) {
  return {
    isOnSubmit: !mode || mode === VALIDATION_MODE.onSubmit,
    isOnBlur: mode === VALIDATION_MODE.onBlur,
    isOnChange: mode === VALIDATION_MODE.onChange,
    isOnAll: mode === VALIDATION_MODE.all,
    isOnTouch: mode === VALIDATION_MODE.onTouched,
  }
}
