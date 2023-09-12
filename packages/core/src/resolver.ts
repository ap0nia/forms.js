import type { CriteriaMode } from './constants'
import type { FlattenObject } from './utils/types/flatten-object'

export type ResolverSuccess<T> = {
  values: T
  errors: {}
}

export type ResolverError<T> = {
  values: {}
  errors: FieldErrors<T>
}

export type ResolverResult<T> = ResolverSuccess<T> | ResolverError<T>

export interface ResolverOptions<T> {
  criteriaMode?: CriteriaMode

  fields: Record<string, Field['_f']>

  /**
   * Flatten the form values object.
   */
  names?: keyof FlattenObject<T>[]

  shouldUseNativeValidation?: boolean
}

export type Resolver<TFieldValues, TContext = any> = (
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>> | ResolverResult<TFieldValues>
