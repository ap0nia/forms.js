import type { FlattenObject } from '../../utils/types/flatten-object'

export type Trigger<T> = <TKey extends keyof FlattenObject<T>>(
  name?: TKey | TKey[] | readonly TKey[],
  options?: TriggerOptions,
) => Promise<void>

export type TriggerOptions = {
  shouldFocus?: boolean
}
