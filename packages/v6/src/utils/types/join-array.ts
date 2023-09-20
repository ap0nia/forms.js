/**
 * A value that can be converted to a string in a string template.
 *
 * i.e. needs to be usable in a TS string template type.
 *
 * @example
 *
 * ```ts
 * type Template = `Hello ${number} ${boolean} ${Stringable}`
 * ```
 */
export type Stringable = string | number | boolean | bigint | null | undefined

/**
 * A really trivial helper that will only add the value if the provided string is not empty.
 */
export type ValueIfNotEmpty<T extends string, TValue extends string> = T extends '' ? '' : TValue

/**
 * Given an array and a separator, join the array into a string, with the separator between each element.
 *
 * Intended to mimic the behavior of {@link Array.join}.
 *
 * The provided array should be composed of {@link Stringable} values, but this is not enforced.
 * Any invalid types will cause the entire type to fail and output `never`.
 */
export type JoinArray<
  T extends unknown[],
  Separator extends string = '.',
  Result extends string = '',
> = T extends []
  ? Result
  : T extends [infer Head, ...infer Rest]
  ? JoinArray<
      Rest,
      Separator,
      `${Result}${ValueIfNotEmpty<Result, Separator>}${Extract<Head, Stringable>}`
    >
  : Result
