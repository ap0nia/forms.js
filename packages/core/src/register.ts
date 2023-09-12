import type { FlattenObject } from './utils/types/flatten-object'
import type { Validate, ValidationRule } from './validation'

/**
 * Options when registering a new field component or element.
 *
 * @param TFieldName is different from the original implementation because it flattens the object and then obtains its keys.
 *
 * @param TFieldValue
 * is a new param that shouldn't be touched,
 * and just adopts the type of the value at the specified key in the flattened object.
 */
export type RegisterOptions<
  TValues extends Record<string, any> = Record<string, any>,
  TFieldName extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
  TFieldValue = FlattenObject<TValues>[TFieldName],
> = {
  required?: string | ValidationRule<boolean>

  min?: ValidationRule<number | string>

  max?: ValidationRule<number | string>

  maxLength?: ValidationRule<number>

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
  | {
      pattern?: ValidationRule<RegExp>
      valueAsNumber?: false
      valueAsDate?: false
    }
  | {
      pattern?: undefined
      valueAsNumber?: false
      valueAsDate?: true
    }
  | {
      pattern?: undefined
      valueAsNumber?: true
      valueAsDate?: false
    }
