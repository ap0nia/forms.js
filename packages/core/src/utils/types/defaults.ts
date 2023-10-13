import type { DeepPartial } from './deep-partial'

/**
 * When setting defaults (i.e. in a general context), any of these forms are allowed.
 */
export type Defaults<T> =
  | ValueOrDeepPartial<T>
  | Promise<ValueOrDeepPartial<T>>
  | (() => ValueOrDeepPartial<T> | Promise<ValueOrDeepPartial<T>>)

/**
 * The value or a deeply optional version of the value are allowed as defaults.
 */
export type ValueOrDeepPartial<T> = DeepPartial<T> | T
