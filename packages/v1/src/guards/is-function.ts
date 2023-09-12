export type AnyFunction = (...args: any[]) => any

export function isFunction(value: unknown): value is AnyFunction {
  return typeof value === 'function'
}
