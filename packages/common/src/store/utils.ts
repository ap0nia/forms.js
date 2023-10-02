import type { Readable } from './types'

export function get<T = any>(store: Readable<T>): T {
  let value
  store.subscribe((v) => (value = v))()
  return value as T
}
