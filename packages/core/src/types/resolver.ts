import type { CriteriaMode } from '../constants'

import type { FieldErrors } from './errors'
import type { FieldReference } from './fields'
import type { ParseForm } from './parse'

/**
 * A resolver processes the form values and returns a result.
 * i.e. resolving the values/errors of the form.
 */
export type Resolver<
  TFieldValues = Record<string, any>,
  TContext = any,
  TParsedForm = ParseForm<TFieldValues>,
> = (
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues, TParsedForm>,
) => ResolverResult<TFieldValues> | Promise<ResolverResult<TFieldValues>>

/**
 * Resolver options.
 */
export interface ResolverOptions<T, TParsedForm = ParseForm<T>> {
  /**
   * How to handle encountered errors.
   */
  criteriaMode?: CriteriaMode[keyof CriteriaMode]

  /**
   * Override the form fields to parse.
   */
  fields: Record<string, FieldReference>

  /**
   * Names of the fields to parse.
   */
  names?: (keyof TParsedForm)[]

  /**
   * Whether to use native validation by reading the field element.
   */
  shouldUseNativeValidation: boolean | undefined
}

/**
 * A resolver can return a successful result or an error result.
 */
export type ResolverResult<T = Record<string, any>> = ResolverSuccess<T> | ResolverError<T>

/**
 * Successful resolver result.
 */
export type ResolverSuccess<T = Record<string, any>> = {
  /**
   * Return the form values.
   */
  values: T

  /**
   * Don't return any errors.
   */
  errors?: {}
}

export type ResolverError<T = Record<string, any>> = {
  /**
   * Don't return any form values.
   */
  values?: {}

  /**
   * Return the form errors.
   */
  errors: FieldErrors<T>
}
