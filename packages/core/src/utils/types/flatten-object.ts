import type { ObjectToUnion } from './object-to-union'
import type { Prettify } from './prettify'
import type { UnionToIntersection } from './union-to-intersection'

/**
 * Flatten an object into a single-depth object.
 *
 * Nested properties are concatenated with a dot.
 *
 * @remarks
 * It also recursively includes all nested properties at the top level,
 * including those that are also objects.
 *
 * @example
 *
 * ```ts
 * type X = {
 *   a: {
 *     b: string,
 *     c: {
 *        d: number
 *     }
 *   },
 *   e: boolean
 * }
 *
 * type Y = {
 *   a: { b: string }[]
 * }
 *
 * type A = FlattenObject<X>
 * //   ^? type A =
 * {
 *   "a.b": string;
 *   "a.c.d": number;
 *   "a.c": {
 *      d: number;
 *    };
 *    a: {
 *      b: string;
 *      c: {
 *        d: number;
 *      };
 *    };
 *   e: boolean;
 * }
 *
 * type B = FlattenObject<Y>
 * //   ^? type B =
 * {
 *   a: { b: string }[];
 *   [x: `a.${number}`]: { b: string };
 *   [x: `a.${number}.b`]: string;
 * }
 * ```
 *
 * [TypeScript Playground](https://www.typescriptlang.org/play?#code/C4TwDgpgBAkgzgQQHYgDwBUB8UC8UAMUEAHsBEgCZxQCMUAZFOlAPxTABOArtAFxQAzAIYAbOBABQE0JCgBlTgEskAcyEAjEdDxwlqqAB8oSLgFt1EDoajqA9ra1Ck19YpXLg1kyJHWulCAFlCAopGWgANVEeGAEAOVtgAFFTMFAMIlJyKihdDmUVABooKJEebDxmEjJKagByOtYoBqh+Up4w8GgAKVtlBA4OITQJKCZMmpz-AGskWwB3JABtAF1C0fkIMCEh4FsrauzqPILcZoA6OvWxgCUIOC4RT0Pa3L0VM4b1ivGXnNWNmw7g8nht+FUsq8lsoBJYoAAJCBCCjFc5omFw4HAFaAqC9fqDYaoDZjW73YDXUljORbHZCPYcSlUgAGABIAN7Ax7AAC+HPaEFiCWSqXSXKexRp212+0wfPZSVIQwAxsBUIjkZL3hotHLmSSoJgwVBxcBOrIAAocCDAYCKARoLBneDIR3YP7UTg8JpOECtKDsqBLADSUGUUGmEBAtgETBW4JDKygPIYAZ55ugAFUkIpbEh0LYYEgyBxxKrc0hUJmfgAKTMTI5QX1NGvTfiZgCUuGwADc+hR-UgID3LF2PVAaxs22GkLCrDB1l2cL3+7iYMahyOOBmoAB5dQAKwgqoL2YrGGKwaj1HHMzmi1WZ1WPxdKAw7shOS9kjGbF9YINMYjHZQCqSDUNw0jaNY3QeNYEQN90ETD9Jk9bgfzAzC2EDJY5C4dQrz9cN8SQAYhjQJY0XOQi4EvFZMDgpDgyTdNMMwhNmIbV4awxKxOwBNiwJYUDBKAgMgzwgioxnPE+lIwkKKomi6IYjiWJE0TgIk-DCJkkiyKJSi0WUqBg2KExzEsei4MVTghFVAzHWQ5MNMEow6y4nI7mVfYKFQE5VGKX1sDYfcjxPWwzzzKtiiM6jr0vcyzAsDh6MHYdR1c0k1M86hvN8-z3iClAjVE0lQsPY9gFPHNoqYtYgyUhLTPorKxn4HDJN04i5Mc1A4pM5jVKYRMXMEnkligmM41A9yaKWOotFUYAAAs6iTcdCDYTc4Q67SpKI5x9IU1AaOG5geQ7HdbJVYA+qdSpconXioH4pM2HrcEpBIMB9k8cIoAAMREekajCqr3zOK0bTtB0q1q-NC2LSwyztaLwYiqLKywTAjR3AANM4QLGIQOoNdR+ACooDWVMm2IofgLJSg1WOTSkIH4OwHCRJAJHTaQuigABNImNlJ8SKbefJ9AmnF+YBhAzmB0HyAxtV8aNAB6TXSQAPWEgXZAAISVkHbVVyrVVQIWtZ1sZ9aAA)
 */
export type FlattenObject<T> = Prettify<UnionToIntersection<ObjectToUnion<T>>>
