/**
 * A value that can be converted to a string, i.e. in a string template.
 */
export type Stringable = string | number | boolean | bigint | null | undefined

/**
 * A really trivial helper that will only add a separator if the provided string is not empty.
 */
export type SeparatorIfNotEmpty<T extends string, Seperator extends string> = T extends ''
  ? ''
  : Seperator

/**
 * Given an array and a separator, join the array into a string, with the separator between each element.
 */
export type Join<
  T extends unknown[],
  Separator extends string = '.',
  Result extends string = '',
> = T extends []
  ? Result
  : T extends [infer Head, ...infer Rest]
  ? Join<
      Rest,
      Separator,
      `${Result}${SeparatorIfNotEmpty<Result, Separator>}${Extract<Head, Stringable>}`
    >
  : Result
