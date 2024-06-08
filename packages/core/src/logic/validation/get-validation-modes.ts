import { VALIDATION_EVENTS, type ValidationEvent, type ValidationMode } from '../../constants'

/**
 * Takes a validation mode and returns an object with booleans for each mode.
 *
 * Just makes comparisons easier for subsequent branching logic, i.e. for specific event handling.
 */
export function getValidationMode(mode?: ValidationEvent[keyof ValidationEvent]): ValidationMode {
  return {
    onSubmit: !mode || mode === VALIDATION_EVENTS.onSubmit,
    onBlur: mode === VALIDATION_EVENTS.onBlur,
    onChange: mode === VALIDATION_EVENTS.onChange,
    all: mode === VALIDATION_EVENTS.all,
    onTouched: mode === VALIDATION_EVENTS.onTouched,
  }
}
