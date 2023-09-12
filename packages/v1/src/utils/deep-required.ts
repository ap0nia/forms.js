import type { AnyRecord } from './any-record'

export type DeepRequired<T> = T extends AnyRecord
  ? { [K in keyof T]-?: NonNullable<DeepRequired<T[K]>> }
  : T
