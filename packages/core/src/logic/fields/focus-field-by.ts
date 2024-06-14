import type { FieldRecord } from '../../types/fields'

import { iterateFieldsByAction, type IterateAction } from './iterate-fields-by-action'

/**
 * Abstraction over {@link iterateFieldsByAction}. The parent form control just needs to
 * provide a callback function for determining whether the field should be focused.
 */
export function focusFieldBy(
  fields: FieldRecord,
  shouldFocus: (name?: string) => unknown,
  fieldNames?: Set<string> | string[],
  abortEarly?: boolean,
): void {
  const focusInput: IterateAction = (ref, name) => {
    if (shouldFocus(name)) {
      ref.focus?.()
      return 1
    }
    return
  }

  return iterateFieldsByAction(fields, focusInput, fieldNames, abortEarly)
}
