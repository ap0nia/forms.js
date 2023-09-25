import type { FieldReference } from '../../types/fields'

export function hasValidation(_f: FieldReference) {
  return (
    _f.mount &&
    (_f.required || _f.min || _f.max || _f.maxLength || _f.minLength || _f.pattern || _f.validate)
  )
}
