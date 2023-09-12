/* eslint-disable @typescript-eslint/ban-types */

/**
 * @see https://twitter.com/mattpocockuk/status/1622730173446557697?s=20
 */
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}
