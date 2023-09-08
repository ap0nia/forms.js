import type { IsAny } from '../type-utils/is-any'

export type Primitive = null | undefined | string | number | boolean | symbol | bigint

export type LiteralUnion<T extends U, U extends Primitive> = T | (U & { _?: never })

/**
 * A noop is any sort of function that's intended to do nothing.
 */
export type Noop = (...args: unknown[]) => unknown

/**
 * A nullish type. Because void isn't considered the same as null | undefined ??
 */
export type Nullish = null | undefined | void

export type BrowserNativeObject = Date | FileList | File

export type EmptyObject = { [K in string | number]: never }

export type NonUndefined<T> = T extends undefined ? never : T

export type DeepMap<T, TValue> = IsAny<T> extends true
  ? any
  : T extends BrowserNativeObject
  ? TValue
  : T extends object
  ? { [K in keyof T]: DeepMap<NonUndefined<T[K]>, TValue> }
  : TValue

export type Merge<A, B> = {
  [K in keyof A | keyof B]?: K extends keyof A & keyof B
    ? [A[K], B[K]] extends [object, object]
      ? Merge<A[K], B[K]>
      : A[K] | B[K]
    : K extends keyof A
    ? A[K]
    : K extends keyof B
    ? B[K]
    : never
}
