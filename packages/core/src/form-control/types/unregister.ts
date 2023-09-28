import type { RegisterOptions } from '../../types/register'
import type { FlattenObject } from '../../utils/types/flatten-object'
import type { LiteralUnion } from '../../utils/types/literal-union'

import type { KeepStateOptions } from './keep-state'

export type Unregister<T> = <TKey extends keyof FlattenObject<T>>(
  name?: TKey | TKey[] | readonly TKey[],
  options?: UnregisterOptions,
) => void

export type UnregisterElement<T> = <TKey extends keyof FlattenObject<T>>(
  name: LiteralUnion<Extract<TKey, string>, string>,
  options?: RegisterOptions<T, TKey>,
) => void
/**
 * Options when unregistering a field.
 */
export interface UnregisterOptions extends KeepStateOptions {
  /**
   * Whether to preserve its value in the form's values.
   */
  keepValue?: boolean

  /**
   * Whether to preserve its default value in the form's default values.
   */
  keepDefaultValue?: boolean

  /**
   * Whether to preserve any errors assigned to the field.
   */
  keepError?: boolean
}
