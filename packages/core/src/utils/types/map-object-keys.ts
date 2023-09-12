/**
 * Given a tuple of keys belonging to an object, return a tuple with the values at each key.
 * i.e. map the object keys to their values.
 *
 * This type ***does not*** enforce that the provided tuple only has valid keys of the object.
 * Any invalid keys will be mapped to `never`.
 */
export type MapObjectKeys<
  T extends Record<string, any>,
  Keys extends unknown[],
  Answer extends unknown[] = [],
> = Keys extends []
  ? Answer
  : Keys extends [infer Head, ...infer Tail]
  ? MapObjectKeys<T, Tail, [...Answer, T[Extract<Head, keyof T>]]>
  : T
