import { isObject } from './is-object'
import { isPrimitive } from './is-primitive'

export function deepEqual(left: any, right: any) {
  if (isPrimitive(left) || isPrimitive(right)) {
    return left === right
  }

  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime()
  }

  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)

  if (leftKeys.length !== rightKeys.length) {
    return false
  }

  for (const key of leftKeys) {
    const val1 = left[key]

    if (!rightKeys.includes(key)) {
      return false
    }

    if (key !== 'ref') {
      const val2 = right[key]

      if (
        (val1 instanceof Date && val2 instanceof Date) ||
        (isObject(val1) && isObject(val2)) ||
        (Array.isArray(val1) && Array.isArray(val2))
          ? !deepEqual(val1, val2)
          : val1 !== val2
      ) {
        return false
      }
    }
  }

  return true
}
