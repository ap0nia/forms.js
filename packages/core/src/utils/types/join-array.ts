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
export type ValueIfNotEmpty<T extends string, Value> = T extends '' ? '' : Value

/**
 * Given an array and a separator, join the array into a string, with the separator between each element.
 *
 * Intended to mimic the behavior of {@link Array.join}.
 *
 * The provided array should be composed of {@link Stringable} values, but this is not enforced.
 * Any invalid types will cause the entire type to fail and output `never`.
 *
 * @example
 *
 * ```ts
 * type A = JoinArray<['a', 'b', 'c'], '.'>
 * //  ^?
 *
 * type B = JoinArray<[1, undefined, true, 'hello'], '__'>
 * //   ^?
 *
 * type C = JoinArray<[ { invalid: 'string template' } ], '.'>
 * //   ^?
 * ```
 *
 * [Playground Link](https://www.typescriptlang.org/play?ssl=26&ssc=8&pln=19&pc=1#code/C4TwDgpgBAysBOBLAdgcwIYCMA20C8UAzgiqlAD5TICuAtphPBVJgPau7rLOaKorBmNbNmbVkAEwgAzFBAkAoBaEhQAaumzUIASWkA5VsACitMKAA8AFSgQAHsAiTCREmgA06zdoB8UAjb2js5QAOShUAD8YREAXF5aEEr2YKzwgirQAFKsKACC8PDoIBYKUFCBDk4SLuIA1sisAO7IANoAuu5lsBBg6EXAabZVIcRIaP5hAHShXeUAShCE1NiCQdUuY6ST4V1+AcPBNVAd3dGLy6vd8ZVHLq0o0oxQABIQ6BKeU9+PzxfA7TOUBy+UKxVK5UhUH+cyhPT6AzSsKhAAMACQAbwuK2AAF9MRpEnpDCYzJZsatPDBev10IN4D58RjjA4igBjYAWN4fKluDA4CCMlHdco+a7QpY4pSZKB5SYg5AFIolVqhdCzMKYDWhNmhTrTUJigD0RshAD1ItLwNAAELy3KKsEqgCMnnEUlkyHkngQ2k8oQAFhARKw9f6APrhw0KE3my3Ka1QADC9tByosrSgGKgKAAbppEBJ4qEthNHGZsHSIBFcVB9aEZsbTeULQogA)
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
