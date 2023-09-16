export type Primitive = null | undefined | string | number | boolean | symbol | bigint

/**
 * Whether the value is a simple primitive. i.e. not an object, array, etc.
 *
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/utils/isPrimitive.ts
 */
export function isPrimitive(value: unknown): value is Primitive {
  return value == null || typeof value !== 'object'
}
