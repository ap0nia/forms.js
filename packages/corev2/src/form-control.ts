export type Prettify<T> = IsAny<T> extends true ? any : { [K in keyof T]: T[K] } & {}

export type IsAny<T> = 0 extends 1 & T ? true : false

export type Stringable = string | number | boolean | bigint | null | undefined

export type ValueIfNotEmpty<T extends string, Value> = T extends '' ? '' : Value

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

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never

export type ObjectToUnion<T, Keys extends unknown[] = []> = IsAny<T> extends true
  ? any
  :
      | {
          [K in keyof T]: IsAny<T[K]> extends true
            ? { [SubKey in JoinArray<[...Keys, K]>]: T[K] }
            : T[K] extends (infer U)[]
            ?
                | { [SubKey in JoinArray<[...Keys, K]>]: T[K] }
                | { [SubKey in JoinArray<[...Keys, K, number]>]: ExtractArray<T[K]> }
                | (U extends Record<string, any> ? ObjectToUnion<U, [...Keys, K, number]> : never)
            : T[K] extends Record<string, any>
            ? ObjectToUnion<T[K], [...Keys, K]>
            : { [SubKey in JoinArray<[...Keys, K]>]: T[K] }
        }[keyof T]
      | (Keys['length'] extends 0 ? never : { [SubKey in JoinArray<Keys>]: T })

type ExtractArray<T> = T extends (infer U)[] ? U : T

export type FlattenObject<T> = Prettify<
  UnionToIntersection<Extract<ObjectToUnion<T>, Record<string, any>>>
>
