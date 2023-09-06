/**
 * I love TS.
 */
export type MaybeReadonlyArray<T> = T | ReadonlyArray<T>

/**
 * Why doesn't this narrowing happen automatically??
 *
 * If I have something that's a {@link MaybeReadonlyArray},
 * using `Array.isArray` won't narrow it properly ??
 *
 * @example
 *
 * ```ts
 * const myArray: MaybeReadonlyArray<string> = ['a', 'b', 'c']
 *
 * if (Array.isArray(myArray)) {
 *   // myArray is any[], i.e. a version of "never" because it doesn't know what it is??
 * } else {
 *   // myArray is still MaybeReadonlyArray<string>
 * }
 *
 * ```
 *
 */
export function isReadonlyArray<T>(value: unknown): value is ReadonlyArray<T> {
  return Array.isArray(value)
}
