import type { FlattenObject } from '../../utils/types/flatten-object'

export type SetValue<T, TFlattened = FlattenObject<T>> = <TKey extends keyof TFlattened>(
  name: Extract<TKey, string>,
  value: TFlattened[TKey],
  options?: SetValueOptions,
) => void

/**
 * Options when setting a value.
 */
export type SetValueOptions = {
  /**
   */
  shouldValidate?: boolean

  /**
   */
  shouldDirty?: boolean

  /**
   */
  shouldTouch?: boolean
}
