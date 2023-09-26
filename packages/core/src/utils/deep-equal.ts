import { isObject } from './is-object'
import { isPrimitive } from './is-primitive'

/**
 * Deeply compare two objects.
 *
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/utils/deepEqual.ts
 */
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

  const leftKeys = Object.keys(left)

  const rightKeys = Object.keys(right)

  if (leftKeys.length !== rightKeys.length) {
    return false
  }

  for (const key of leftKeys) {
    if (!rightKeys.includes(key)) {
      return false
    }

    const a: any = left[key as keyof typeof left]

    const b: any = right[key as keyof typeof right]

    if (isPrimitive(a) && isPrimitive(b) && a !== b) {
      return false
    }

    if ((bothDates(a, b) || bothObjects(a, b) || bothArrays(a, b)) && !deepEqual(a, b)) {
      return false
    }
  }

  return true
}

function bothDates(val1: unknown, val2: unknown): boolean {
  return val1 instanceof Date && val2 instanceof Date
}

function bothObjects(val1: unknown, val2: unknown): boolean {
  return isObject(val1) && isObject(val2)
}

function bothArrays(val1: unknown, val2: unknown): boolean {
  return Array.isArray(val1) && Array.isArray(val2)
}
