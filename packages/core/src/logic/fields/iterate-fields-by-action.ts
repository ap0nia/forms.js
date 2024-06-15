import { get } from '@hookform/common/utils/get'
import { isObject } from '@hookform/common/utils/is-object'

import type { FieldElement, FieldRecord } from '../../types/fields'

export type IterateAction = (element: FieldElement, name: string) => 1 | undefined | void

/**
 * Low-level implementation for iterating over specified form fields and performing an action.
 *
 * Can be used for focusing on the first input, disabling fields, etc.
 *
 * As far as I can tell, @param abortEarly is never actually used...
 */
export function iterateFieldsByAction(
  fields: FieldRecord,
  action: IterateAction,
  fieldsNames?: Set<string> | string[] | 0,
  abortEarly?: boolean,
) {
  for (const key of fieldsNames || Object.keys(fields)) {
    const field = get(fields, key)

    if (field) {
      const { _f, ...currentField } = field

      if (_f) {
        if (_f.refs && _f.refs[0] && action(_f.refs[0], key) && !abortEarly) {
          break
        } else if (_f.ref && action(_f.ref, _f.name) && !abortEarly) {
          break
        } else {
          iterateFieldsByAction(currentField, action)
        }
      } else if (isObject(currentField)) {
        iterateFieldsByAction(currentField, action)
      }
    }
  }
}

export default iterateFieldsByAction
