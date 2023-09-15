import { isObject } from './is-object'
import { isPrimitive } from './is-primitive'

export function deepEqual(left: unknown, right: unknown): boolean {
  if (left == null || right == null) {
    return left === right
  }

  if (isPrimitive(left) || isPrimitive(right)) {
    return left === right
  }

  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime()
  }

  if (!isObject(left) || !isObject(right)) {
    return false
  }

  const leftKeys = Object.keys(left ?? {})
  const rightKeys = Object.keys(right ?? {})

  if (leftKeys.length !== rightKeys.length) {
    return false
  }

  for (const key of leftKeys) {
    const val1: any = left[key as keyof typeof left]

    if (!rightKeys.includes(key)) {
      return false
    }

    // if (key !== 'ref') {
    // }

    const val2: any = right[key as keyof typeof right]

    if ((val1 instanceof Date && val2 instanceof Date) || (isObject(val1) && isObject(val2))) {
      return false
    }

    if (Array.isArray(val1) && (Array.isArray(val2) ? !deepEqual(val1, val2) : val1 !== val2)) {
      return false
    }
  }

  return true
}
