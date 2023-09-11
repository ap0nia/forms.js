export function safeNotEqual(a: unknown, b: unknown): boolean {
  return a != a ? b == b : a !== b || (!!a && typeof a === 'object') || typeof a === 'function'
}
