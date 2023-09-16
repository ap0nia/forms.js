/* eslint-disable @typescript-eslint/ban-types */

import type { IsAny } from './is-any'

/**
 * @see https://twitter.com/mattpocockuk/status/1622730173446557697?s=20
 *
 * Explicit `any` will not be handled.
 */
export type Prettify<T extends Record<PropertyKey, any>> = IsAny<T> extends true
  ? T
  : { [K in keyof T]: T[K] } & {}
