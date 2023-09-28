import type { RegisterOptions, RegisterResult } from '../../types/register'
import type { FlattenObject } from '../../utils/types/flatten-object'

export type Register<T> = <TKey extends keyof FlattenObject<T>>(
  name: Extract<TKey, string>,
  options?: RegisterOptions<T, TKey>,
) => RegisterResult

export type RegisterElement<T> = <TKey extends keyof FlattenObject<T>>(
  name: Extract<TKey, string>,
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  options?: RegisterOptions<T, TKey>,
) => void
