import type { Noop } from '../utils/noop'
import type { Nullish } from '../utils/null'
import type { FlattenObject } from '../utils/types/flatten-object'

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
export type FieldRecord = Partial<{ [K: string]: (Field | FieldRecord) & Field }>

/**
 * A typical field will only have a `_f` property to store lower-level details.
 *
 * Inside a {@link FieldRecord}, fields can also contain nested field records.
 * This might not be achievable normally, but is handled in the code.
 *
 * @example
 *
 * ```ts
 * type TheoreticalFormFields = 'name' | 'name.initials'
 *
 * const theoreticalFormFields = {
 *  name: {
 *    _f: {
 *      // Field details for 'name'.
 *    },
 *
 *    initials: {
 *      _f: {
 *        // Field details for 'name.initials'.
 *      }
 *    }
 *  }
 * }
 * ```
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
   * Idk.
   */
  mount?: boolean
} & RegisterOptions

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
export type CustomElement<T = Record<string, any>> = {
  /**
   * Name of the field.
   */
  name: keyof FlattenObject<T>

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

// export function getFieldValue(_f: Field['_f']) {
//   const ref = _f.ref
//
//   if (_f.refs ? _f.refs.every((ref) => ref.disabled) : ref.disabled) {
//     return
//   }
//
//   if (isFileInput(ref)) {
//     return ref.files
//   }
//
//   if (isRadioInput(ref)) {
//     return getRadioValue(_f.refs).value
//   }
//
//   if (isMultipleSelectInput(ref)) {
//     return [...ref.selectedOptions].map(({ value }) => value)
//   }
//
//   if (isCheckBoxInput(ref)) {
//     return getCheckboxValue(_f.refs).value
//   }
//
//   return getFieldValueAs(ref.value == null ? _f.ref.value : ref.value, _f)
// }
//
// export function getFieldValueAs(value: unknown, _f: Field['_f']) {
//   const { valueAsNumber, valueAsDate, setValueAs } = _f
//
//   return value == null
//     ? value
//     : valueAsNumber
//     ? value === ''
//       ? NaN
//       : value
//       ? +value
//       : value
//     : valueAsDate && typeof value === 'string'
//     ? new Date(value)
//     : setValueAs
//     ? setValueAs(value)
//     : value
// }