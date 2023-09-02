import type { FlattenObject } from './utils/flatten-object'
import type { MaybePromise } from './utils/maybe-promise'

/**
 * A thing.
 */
export type ValidationValue = boolean | number | string | RegExp

/**
 * Something.
 */
export type ValidationRule<T extends ValidationValue = ValidationValue> =
  | T
  | ValidationValueMessage<T>

/**
 * Idk.
 */
export type ValidationValueMessage<T extends ValidationValue = ValidationValue> = {
  /**
   * Idk what this is.
   */
  value: T

  /**
   * A message to display if validation fails.
   */
  message: string
}

/**
 * Result of a validation function.
 */
export type ValidateResult = string | string[] | boolean | undefined

/**
 * Validator function.
 */
export type Validator<TFieldValue, TForm> = (
  value: TFieldValue,
  formValues: TForm,
) => MaybePromise<ValidateResult>

export type RegisterOptions<
  TForm extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>,
  TFieldName extends keyof FlattenObject<TForm> = keyof FlattenObject<TForm>,
  TFieldValue = FlattenObject<TForm>[TFieldName],
> = {
  /**
   * Whether the field is required.
   *
   * If it's a string, then that's the message that will be displayed if validation fails.
   */
  required?: string | ValidationRule<boolean>

  /**
   */
  min?: ValidationRule<number | string>

  /**
   */
  max?: ValidationRule<number | string>

  /**
   */
  minLength?: ValidationRule<number>

  /**
   */
  maxLength?: ValidationRule<number>

  /**
   * Validation function.
   */
  validate: Validator<TFieldValue, TForm> | Record<string, Validator<TFieldValue, TForm>>

  /**
   * The current value?
   */
  value: TFieldValue

  /**
   */
  setValueAs: (value: unknown) => unknown

  /**
   * Idk.
   */
  shouldUnregister?: boolean

  /**
   */
  onChange?: (event: unknown) => unknown

  /**
   */
  onBlur?: (event: unknown) => unknown

  /**
   * Whether the validator is disabled?
   */
  disabled?: boolean

  /**
   * Idk.
   */
  deps?: string | string[]
} & AdditionalRegisterOptions

type AdditionalRegisterOptions =
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
