import type { Noop } from '@forms.js/common/utils/noop'
import type { Nullish } from '@forms.js/common/utils/null'

import type { ParseForm } from './form'
import type { RegisterOptions } from './register'

/**
 * A record of fields maps the structure of the form values to form fields.
 *
 * @example
 * ```ts
 * const myForm = {
 *   name: {
 *     first: 'John',
 *     last: 'Doe'
 *   }
 * }
 *
 * const myFormFields = {
 *   name: {
 *     first: {
 *       _f: {
 *         // Field details for 'name.first'.
 *       }
 *     },
 *     last: {
 *       _f: {
 *         // Field details for 'name.last'.
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type FieldRecord = Partial<{ [K: string]: (Field | FieldRecord) & (Field | { _f?: never }) }>

/**
 * Most fields will only have an `_f` property to store lower-level details.
 */
export type Field = { _f: FieldReference }

/**
 * A field reference contains concrete information about the field.
 */
export type FieldReference = {
  /**
   * A ref points to the original element.
   */
  ref: FieldElement

  /**
   * Name of the field.
   */
  name: string

  /**
   * Associated elements.
   *
   * i.e. select and radio inputs have multiple elements under them.
   */
  refs?: HTMLInputElement[]

  /**
   * Whether the field has been mounted yet.
   *
   * When a field is first registered, basic details about the field are added to the form control.
   * However, information about the HTML element itself will not be present until the it's also registered.
   * When the actual HTML element is registered, then mounted should be set to true.
   */
  mount?: boolean
} & RegisterOptions<any, any>

/**
 * A field element is any element that can be registered as a valid form component.
 */
export type FieldElement<T = Record<string, any>> =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | CustomElement<T>

/**
 * A custom element is a component that simulates an HTML element.
 */
export type CustomElement<T, TParsedForm extends ParseForm<T> = ParseForm<T>> = {
  /**
   * Name of the field.
   */
  name: TParsedForm['keys'][number]

  /**
   * Type of the field to be registered as.
   *
   * @example 'checkbox', 'radio', 'select', 'input', etc.
   */
  type?: string

  /**
   * Value of the field.
   */
  value?: any

  /**
   * Whether the field is disabled.
   */
  disabled?: boolean

  /**
   * Whether the field is checked. i.e. for checkboxes and radio inputs.
   */
  checked?: boolean

  /**
   * Options for the field. i.e. for select inputs.
   */
  options?: HTMLOptionsCollection

  /**
   * Files for the field. i.e. for file inputs.
   */
  files?: FileList | Nullish

  /**
   * Callback function to focus on the field.
   */
  focus?: Noop
}
