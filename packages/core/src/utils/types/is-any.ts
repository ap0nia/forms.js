/**
 * Detects whether the given type is explicitly `any`.
 *
 * 0 can only extend 1 if it is intersected with `any`.
 *
 * @example (Verbose)
 *
 * ```ts
 * type A = 0 extends (1 & number) ? true : false
 * //   ^? false
 *
 * type B = 0 extends (1 & string) ? true : false
 * //   ^? false
 *
 * type C = 0 extends (1 & {}) ? true : false
 * //   ^? false
 *
 * type D = 0 extends (1 & any) ? true : false
 * //   ^? true
 * ```
 *
 * @see [StackOverflow](https://stackoverflow.com/a/49928360)
 * @see [TypeScript playground](https://www.typescriptlang.org/play?#code/KYDwDg9gTgLgBDAnmYcCSBnAggO0QHgBUA+OAXjgAY5QZgcATDOARjgDI5C4B+BKAK6oAXHABmAQwA2GYACg5SFHCxsKmXARwCAtgCNgUYnID0JuBYB6PBUtQAhNemx58GGFACWOAObGzFnDWtsioAMJOGq4A3gC+-uZWNoqhcAAikS4EEngJgcEKAQBqhnoQsnAMwDoQOO5QEjCetQB0IcpY5FQ0IHSMzAAUbJza+oYAlLz8QnCikjLyAUlycCnK9l3UtPRMcEMccPXePpN8HjNz0rKmiUE2q3ZwYZs9fbv7nHGn0yLiV4u3YIPVJpF7bfp7YZwHKIb7nX7za5LO5AA)
 */
export type IsAny<T> = 0 extends 1 & T ? true : false
