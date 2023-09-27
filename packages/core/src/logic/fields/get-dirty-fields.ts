import { deepEqual } from '../../utils/deep-equal'
import { isObject } from '../../utils/is-object'
import { isPrimitive } from '../../utils/is-primitive'
import { objectHasFunction } from '../../utils/object-has-function'
import type { DeepPartial } from '../../utils/types/deep-partial'

export function getDirtyFields<T>(defaultValues: DeepPartial<T>, formValues: T) {
  return getDirtyFieldsFromDefaultValues(defaultValues, formValues, markFieldsDirty(formValues))
}

export function getDirtyFieldsFromDefaultValues<T>(data: T, formValues: T, dirtyFields: any) {
  const isParentNodeArray = Array.isArray(data)

  if (!isObject(data) && !isParentNodeArray) {
    return dirtyFields
  }

  for (const key in data) {
    const isArray = Array.isArray(data[key])

    if (!(isArray || (isObject(data[key]) && !objectHasFunction(data[key])))) {
      dirtyFields[key] = !deepEqual(data[key], formValues[key])
      continue
    }

    if (formValues == null || isPrimitive(dirtyFields[key])) {
      dirtyFields[key] = isArray ? markFieldsDirty(data[key], []) : markFieldsDirty(data[key])
    } else {
      getDirtyFieldsFromDefaultValues(data[key], (formValues?.[key] || {}) as any, dirtyFields[key])
    }
  }

  return dirtyFields
}

export function markFieldsDirty<T>(data: T, fields: Record<string, any> = {}) {
  const isParentNodeArray = Array.isArray(data)

  if (!isObject(data) && !isParentNodeArray) {
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
