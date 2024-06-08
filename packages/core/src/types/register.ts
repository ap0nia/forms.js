import type { ParseForm } from './parse'
import type { Validate, ValidationRule } from './validation'

/**
 * Options when registering a new field component or element.
 */
export type RegisterOptions<
  TValues extends Record<string, any> = Record<string, any>,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
  TFieldName extends TParsedForm['keys'] = TParsedForm['keys'],
  TFieldValue = TParsedForm['values'][TFieldName],
> = {
  /**
   * Native validation, makes the field required.
   */
  required?: string | ValidationRule<boolean>

  /**
   * Native validation, indicates the minimum value or number of characters.
   */
  min?: ValidationRule<number | string>

  /**
   * Native validation, indicates the maximum value or number of characters.
   */
  max?: ValidationRule<number | string>

  /**
   * Native validation, indicates the minimum number of characters.
   */
  maxLength?: ValidationRule<number>

  /**
   * Native validation, indicates the maximum number of characters.
   */
  minLength?: ValidationRule<number>

  /**
   * This implementation is different because it flattens the object,
   * and then accesses the value at some key in the flattened object.
   */
  validate?: Validate<TFieldValue, TValues> | Record<string, Validate<TFieldValue, TValues>>

  /**
   * The value of the field.
   */
  value?: TFieldValue

  /**
   * Callback to fully control how the value is set.
   */
  setValueAs?: (value: any) => any

  /**
   * Not sure when this is checked or what it's used for.
   */
  shouldUnregister?: boolean

  /**
   * Callback for the input's 'change' event.
   */
  onChange?: (event: Event) => void

  /**
   * Callback for the input's 'blur' event.
   */
  onBlur?: (event: Event) => void

  /**
   * Whether the field is disabled.
   */
  disabled?: boolean

  /**
   * Dependencies on other form fields.
   */
  deps?: TParsedForm['keys'] | TParsedForm['keys'][]
} & (
  | {
      /**
       * Regular expression to validate the field.
       */
      pattern?: ValidationRule<RegExp>

      /**
       * Native validation, indicates the value is a number.
       */
      valueAsNumber?: false

      /**
       * Native validation, indicates the value is a date.
       */
      valueAsDate?: false
    }
  | {
      /**
       * Regular expression to validate the field.
       */
      pattern?: undefined

      /**
       * Native validation, indicates the value is a number.
       */
      valueAsNumber?: false

      /**
       * Native validation, indicates the value is a date.
       */
      valueAsDate?: true
    }
  | {
      /**
       * Regular expression to validate the field.
       */
      pattern?: undefined

      /**
       * Native validation, indicates the value is a number.
       */
      valueAsNumber?: true

      /**
       * Native validation, indicates the value is a date.
       */
      valueAsDate?: false
    }
)

export type RegisterResult = {
  /**
   * After registering a field, an HTML element can be registered to it.
   */
  registerElement: (element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => void

  /**
   * Unregister the field.
   */
  unregisterElement: () => void
}
