import type { FlattenObject } from './utils/flatten-object'
import type { Noop } from './utils/noop'
import type { RegisterOptions } from './validator'

/**
 * A custom field element has these properties.
 */
export type CustomElement<T> = {
  /**
   * The name of the field.
   */
  name: keyof FlattenObject<T>

  /**
   * The type of the field.
   *
   * @example 'checkbox', 'radio', 'select', 'file'
   */
  type?: string

  /**
   * The value of the field.
   */
  value?: unknown

  /**
   * Whether the field is disabled.
   */
  disabled?: boolean

  /**
   * Whether the field is checked. i.e. for checkboxes and radio buttons.
   */
  checked?: boolean

  /**
   * Options for the field. i.e. for select elements.
   */
  options?: HTMLOptionsCollection

  /**
   * The files of the field. i.e. for file inputs.
   */
  files?: FileList | null

  /**
   * What to do when the field is focused.
   */
  focus?: Noop
}

export type FieldElement<T = any> =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | CustomElement<T>

/**
 * Idk what this stands for.
 */
export type Field = {
  /**
   * The original element referenced by the field.
   */
  ref: FieldElement

  /**
   * The name of the field.
   */
  name: string

  /**
   * Actual HTML elements used by the field.
   */
  refs?: HTMLInputElement[]

  /**
   * Whether it's mounted?
   */
  mount?: boolean
} & RegisterOptions
