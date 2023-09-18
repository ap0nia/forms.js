import type { CriteriaMode } from '../constants'
import type { FlattenObject } from '../utils/types/flatten-object'
import type { MaybePromise } from '../utils/types/maybe-promise'

import type { FieldErrors } from './errors'
import type { FieldReference } from './fields'

/**
 * A resolver processes the form values and returns a result.
 * i.e. resolving the values/errors of the form.
 */
export type Resolver<TFieldValues, TContext = any> = (
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => MaybePromise<ResolverResult<TFieldValues>>

/**
 * Resolver options.
 */
export interface ResolverOptions<T> {
  /**
   * How to handle encountered errors.
   */
  criteriaMode?: CriteriaMode

  /**
   * Override the form fields to parse.
   */
  fields: Record<string, FieldReference>

  /**
   * Flatten the form values object.
   */
  names?: Extract<keyof FlattenObject<T>, string>[]

  /**
   * Whether to use native validation by reading the field element.
   */
  shouldUseNativeValidation?: boolean
}

/**
 * A resolver can return a successful result or an error result.
 */
export type ResolverResult<T> = ResolverSuccess<T> | ResolverError<T>

/**
 * Successful resolver result.
 */
export type ResolverSuccess<T> = {
  /**
   * Return the form values.
   */
  values: T

  /**
   * Don't return any errors.
   */
  errors?: never
}

export type ResolverError<T> = {
  /**
   * Don't return any form values.
   */
  values?: never

  /**
   * Return the form errors.
   */
  errors: FieldErrors<T>
}
