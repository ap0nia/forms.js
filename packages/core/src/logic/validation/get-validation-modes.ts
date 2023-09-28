import { VALIDATION_MODE, type ValidateOnEvent, type ValidationMode } from '../../constants'

/**
 * Takes a validation mode and returns an object with booleans for each mode.
 *
 * Just makes comparisons easier for subsequent branching logic, i.e. for specific event handling.
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
