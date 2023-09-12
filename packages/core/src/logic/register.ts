import type { FlattenObject } from '../utils/types/flatten-object'
import type { Validate, ValidationRule } from './validation'

/**
 * Options when registering a new field component or element.
 *
 * @param TFieldName A key in the flattened form values object.
 * @param TFieldValue Represents the value at TFieldName in the flattened form values object.
 *
 * @remarks Please don't manually set TFieldValue :^)
 */
export type RegisterOptions<
  TValues extends Record<string, any> = Record<string, any>,
  TFieldName extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
  TFieldValue = FlattenObject<TValues>[TFieldName],
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
   * Not sure what this is.
   */
  setValueAs: (value: any) => any

  /**
   * Not sure when this is checked or what it's used for.
   */
  shouldUnregister?: boolean

  /**
   * Not sure.
   */
  onChange?: (event: any) => void

  /**
   * Something.
   */
  onBlur?: (event: any) => void

  /**
   * Whether the field is disabled.
   */
  disabled?: boolean

  /**
   * Dependencies?
   */
  deps?: string | string[]
} & AdditionalRegisterOptions

/**
 * Additional register options.
 */
export type AdditionalRegisterOptions =
  | AdditionalValidationOptions<RegExp, false, false>
  | AdditionalValidationOptions<undefined, false, true>
  | AdditionalValidationOptions<undefined, true, false>

/**
 * More native validation options.
 */
export type AdditionalValidationOptions<TPattern, TValueAsNumber, TValueAsDate> = {
  /**
   * Regular expression to validate the field.
   */
  pattern?: ValidationRule<TPattern>

  /**
   * Native validation, indicates the value is a number.
   */
  valueAsNumber?: TValueAsNumber

  /**
   * Native validation, indicates the value is a date.
   */
  valueAsDate?: TValueAsDate
}
