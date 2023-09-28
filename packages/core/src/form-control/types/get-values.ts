import type { FlattenObject } from '../../utils/types/flatten-object'
import type { KeysToProperties } from '../../utils/types/keys-to-properties'

/**
 * A method that returns the form control's values.
 */
export interface GetValues<T, TFlattened = FlattenObject<T>> {
  /**
   * If no arguments passed, returns all the form values.
   */
  (): T

  /**
   * If a single key is passed, returns the value of that key.
   */
  <TKey extends keyof TFlattened>(field: TKey): TFlattened[TKey]

  /**
   * If multiple keys are passed as an array, returns the values of those keys as an array.
   */
  <TKey extends keyof TFlattened>(fields: TKey[]): KeysToProperties<TFlattened, TKey[]>

  /**
   * If multiple keys are passed as spread arguments, returns the values of those keys as an array.
   */
  <TKeys extends (keyof TFlattened)[]>(...fields: TKeys): KeysToProperties<TFlattened, TKeys>
}
