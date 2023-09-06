import type { CriteriaMode, Mode, RevalidationMode } from '../constants'
import type { DeepPartial } from '../type-utils/deep-partial'
import type { FlattenObject } from '../type-utils/flatten-object'

import type { FieldName, FieldValues } from './fields'

export type DefaultValues<TFieldValues> = TFieldValues extends AsyncDefaultValues<TFieldValues>
  ? DeepPartial<Awaited<TFieldValues>>
  : DeepPartial<TFieldValues>

export type AsyncDefaultValues<T> = (payload?: unknown) => Promise<T>

/**
 * What to do when transitioning between states?
 */
export type KeepStateOptions = {
  /**
   * Whether to keep the form's current values that are dirty.
   */
  keepDirtyValues?: boolean

  /**
   * Whether to keep errors.
   */
  keepErrors?: boolean

  /**
   * Whether to keep the form marked as dirty.
   */
  keepDirty?: boolean

  /**
   * Whether to keep the form's current values.
   */
  keepValues?: boolean

  /**
   * Whether to keep the same default values.
   */
  keepDefaultValues?: boolean

  /**
   * Whether to keep the submission status.
   */
  keepIsSubmitted?: boolean

  /**
   * Whether to keep the touched status.
   */
  keepTouched?: boolean

  /**
   * Whether to keep the form's current validation status.
   */
  keepIsValid?: boolean

  /**
   * Whether to keep the form's current submit count.
   */
  keepSubmitCount?: boolean
}

export type UseFormProps<TFieldValues extends FieldValues = FieldValues, TContext = any> = {
  mode?: Mode

  revalidateMode?: RevalidationMode

  defaultValues?: DefaultValues<TFieldValues> | AsyncDefaultValues<TFieldValues>

  resetOptions?: KeepStateOptions

  // resolver

  context?: TContext

  shouldFocusError?: boolean

  shouldUnregister?: boolean

  shouldUseNativeValidation?: boolean

  progressive?: boolean

  criteriaMode?: CriteriaMode

  delayError?: number
}

export type UseFormGetValues<T extends FieldValues> = {
  /**
   * Get the entire form values when no argument is supplied to this function.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
   *
   * @returns form values
   *
   * @example
   * ```tsx
   * <button onClick={() => getValues()}>getValues</button>
   *
   * <input {...register("name", {
   *   validate: (value, formValues) => formValues.otherField === value;
   * })} />
   * ```
   */
  (): T

  /**
   * Get a single field value.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
   *
   * @param name - the path name to the form field value.
   *
   * @returns the single field value
   *
   * @example
   * ```tsx
   * <button onClick={() => getValues("name")}>getValues</button>
   *
   * <input {...register("name", {
   *   validate: () => getValues('otherField') === "test";
   * })} />
   * ```
   */
  <TFieldName extends FieldName<T>>(name: TFieldName): FlattenObject<T>[TFieldName]
  /**
   * Get an array of field values.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
   *
   * @param names - an array of field names
   *
   * @returns An array of field values
   *
   * @example
   * ```tsx
   * <button onClick={() => getValues(["name", "name1"])}>getValues</button>
   *
   * <input {...register("name", {
   *   validate: () => getValues(["fieldA", "fieldB"]).includes("test");
   * })} />
   * ```
   */
  <TFieldNames extends FieldName<T>[]>(
    names: readonly [...TFieldNames],
  ): RecordKeyMapper<FlattenObject<T>, TFieldNames>
}

/**
 * TODO: move this somewhere else.
 *
 * Given a tuple of keys belonging to an object, return a tuple with the values at each key.
 *
 * This type ***does not*** enforce that the provided tuple only has valid keys of the object.
 * Any invalid keys will be mapped to `never`.
 */
export type RecordKeyMapper<
  T extends Record<string, any>,
  Keys extends unknown[],
  Answer extends unknown[] = [],
> = Keys extends []
  ? Answer
  : Keys extends [infer Head, ...infer Tail]
  ? RecordKeyMapper<T, Extract<Tail, string[]>, [...Answer, T[Extract<Head, keyof T>]]>
  : never
