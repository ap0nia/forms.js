export type Stringable = number | string | boolean

/**
 * Joins a tuple of strings with a separator (e.g. "." by default) between each value.
 *
 * @example
 *
 * type Result = Join<['a', 'b', 'c']>
 *      ^? type Result = 'a.b.c'
 */
export type Join<
  T extends any[],
  TSeparator extends string = '.',
  TResult extends string = '',
> = T extends [infer Head extends Stringable, ...infer Tail]
  ? TResult extends ''
    ? Join<Tail, TSeparator, `${Head}`>
    : Join<Tail, TSeparator, `${TResult}${TSeparator}${Head}`>
  : TResult
