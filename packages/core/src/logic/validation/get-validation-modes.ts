import { VALIDATION_MODE, type ValidateOnEvent, type ValidationMode } from '../../constants'

/**
 * Helper.
 */
export function getValidationModes(mode?: ValidationMode[keyof ValidationMode]): ValidateOnEvent {
  return {
    submit: !mode || mode === VALIDATION_MODE.onSubmit,
    blur: mode === VALIDATION_MODE.onBlur,
    change: mode === VALIDATION_MODE.onChange,
    all: mode === VALIDATION_MODE.all,
    touch: mode === VALIDATION_MODE.onTouched,
  }
}
