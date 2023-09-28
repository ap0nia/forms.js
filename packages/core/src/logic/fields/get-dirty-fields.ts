import { deepEqual } from '../../utils/deep-equal'
import { isObject } from '../../utils/is-object'
import { isPrimitive } from '../../utils/is-primitive'
import { objectHasFunction } from '../../utils/object-has-function'
import type { DeepPartial } from '../../utils/types/deep-partial'

export function getDirtyFields<T>(defaultValues: DeepPartial<T>, values: T) {
  const dirtyFields = markFieldsDirty(defaultValues)
  return getDirtyFieldsFromDefaultValues(defaultValues as T, values, dirtyFields)
}

export function getDirtyFieldsFromDefaultValues<T>(data: T, values: T, dirtyFields: any) {
  if (!isObject(data) && !Array.isArray(data)) {
    return dirtyFields
  }

  for (const key in data) {
    const isArray = Array.isArray(data[key])

    if (!(isArray || (isObject(data[key]) && !objectHasFunction(data[key])))) {
      dirtyFields[key] = !deepEqual(data[key], values[key])
      continue
    }

    if (values == null || isPrimitive(dirtyFields[key])) {
      dirtyFields[key] = isArray ? markFieldsDirty(data[key], []) : markFieldsDirty(data[key])
    } else {
      getDirtyFieldsFromDefaultValues(data[key], (values?.[key] || {}) as any, dirtyFields[key])
    }
  }

  return dirtyFields
}

export function markFieldsDirty<T>(data: T, fields: Record<string, any> = {}) {
  if (!isObject(data) && !Array.isArray(data)) {
    return fields
  }

  for (const key in data) {
    if (Array.isArray(data[key]) || (isObject(data[key]) && !objectHasFunction(data[key]))) {
      fields[key] = Array.isArray(data[key]) ? [] : {}
      markFieldsDirty(data[key], fields[key])
    } else if (data[key] != null) {
      fields[key] = true
    }
  }

  return fields
}
