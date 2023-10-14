import type { FieldRecord } from '../..'
import { isObject } from '../../utils/is-object'
import { safeGet } from '../../utils/safe-get'

export function iterateFieldsByAction(
  fields: FieldRecord,
  action: (ref: HTMLElement, name: string) => 1 | undefined | void,
  fieldsNames?: Set<string> | string[] | 0,
  abortEarly?: boolean,
) {
  for (const key of fieldsNames || Object.keys(fields)) {
    const field = safeGet(fields, key)

    if (field) {
      const { _f, ...currentField } = field

      if (_f) {
        if (_f.refs && _f.refs[0] && action(_f.refs[0], key) && !abortEarly) {
          break
        } else if (_f.ref && action(_f.ref, _f.name) && !abortEarly) {
          break
        }
      } else if (isObject(currentField)) {
        iterateFieldsByAction(currentField, action)
      }
    }
  }
}
