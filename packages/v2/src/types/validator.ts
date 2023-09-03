import type { FlattenObject } from '../lib/flatten-object'
import type { MaybeArray } from '../lib/maybe-array'
import type { MaybePromise } from '../lib/maybe-promise'

import type { Message } from './errors'
import type { FieldValues, InternalFieldName } from './fields'

/**
 * Not sure what this is for.
 */
export type ValidationValue = boolean | number | string | RegExp

/**
 * Maybe this is referenced when displaying validation errors?
 */
export type ValidationValueMessage<T extends ValidationValue = ValidationValue> = {
  value: T
  message: Message
}

/**
 * What's a validation rule used for?
 */
export type ValidationRule<T extends ValidationValue = ValidationValue> =
  | T
  | ValidationValueMessage<T>

/**
 */
export type ValidateResult = Message | Message[] | boolean | undefined

/**
 * A validator function.
 */
export type Validate<TFieldValue, TFormValues> = (
  value: TFieldValue,
  formValues: TFormValues,
) => MaybePromise<ValidateResult>

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
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends keyof FlattenObject<TFieldValues> = keyof FlattenObject<TFieldValues>,
  TFieldValue = FlattenObject<TFieldValues>[TFieldName],
> = {
  required?: Message | ValidationRule<boolean>

  min?: ValidationRule<number | string>

  max?: ValidationRule<number | string>

  maxLength?: ValidationRule<number>

  minLength?: ValidationRule<number>

  /**
   * This implementation is different because it flattens the object,
   * and then accesses the value at some key in the flattened object.
   */
  validate:
    | Validate<TFieldValue, TFieldValues>
    | Record<string, Validate<TFieldValue, TFieldValues>>

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
  deps?: MaybeArray<InternalFieldName>
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
