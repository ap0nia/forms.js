import type { Noop } from './utils/noop'

declare const $NestedValue: unique symbol

/**
 * @deprecated to be removed in the next major version
 */
export type NestedValue<TValue extends object = object> = {
  [$NestedValue]: never
} & TValue

export type IsFlatObject<T extends object> = Extract<
  Exclude<T[keyof T], NestedValue | Date | FileList>,
  any[] | object
> extends never
  ? true
  : false

export type FieldName<TFieldValues extends Record<string, any>> =
  IsFlatObject<TFieldValues> extends true ? Extract<keyof TFieldValues, string> : string

export type CustomElement<TFieldValues extends Record<string, any>> = Partial<HTMLElement> & {
  name: FieldName<TFieldValues>
  type?: string
  value?: any
  disabled?: boolean
  checked?: boolean
  options?: HTMLOptionsCollection
  files?: FileList | null
  focus?: Noop
}

export type FieldElement<TFieldValues extends Record<string, any> = Record<string, any>> =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | CustomElement<TFieldValues>
