import type { CriteriaMode } from './constants'
import type { FieldErrors } from './errors'
import type { Field } from './field'
import type { EmptyObject } from './guards/is-empty-object'
import type { FlattenObject } from './utils/flatten-object'
import type { MaybePromise } from './utils/maybe-promise'

export type ResolverSuccessResult<T> = { values: T; errors: EmptyObject }

export type ResolverErrorResult<T> = { values: EmptyObject; errors: FieldErrors<T> }

export type ResolverResult<T> = ResolverSuccessResult<T> | ResolverErrorResult<T>

export type ResolverOptions<T> = {
  /**
   * Idk. When to trigger errors?
   */
  criteriaMode?: CriteriaMode

  /**
   * An array of fields, using flattened dot paths as keys.
   */
  fields: Record<string, Field>

  /**
   * An array of dot paths to property names.
   */
  names?: (keyof FlattenObject<T>)[]

  /**
   * Not sure what this is.
   */
  shouldUseNativeValidation: boolean | undefined
}

/**
 * A resolver does something.
 */
export type Resolver<TForm, TContext> = (
  values: TForm,
  context: TContext | undefined,
  options: ResolverOptions<TForm>,
) => MaybePromise<ResolverResult<TForm>>
