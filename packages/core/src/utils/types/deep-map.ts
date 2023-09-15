import type { IsAny } from './is-any'

export type DeepMap<T, TValue> = IsAny<T> extends true
  ? any
  : T extends object
  ? { [K in keyof T]: T[K] extends undefined ? never : DeepMap<T[K], TValue> }
  : TValue
