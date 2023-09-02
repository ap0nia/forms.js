import type { CriteriaMode } from './constants'
import type { FlattenObject } from './utils/flatten-object'

export type ResolverOptions<T> = {
  /**
   * Idk. When to trigger errors?
   */
  criteriaMode?: CriteriaMode

  /**
   * An array of fields, using flattened dot paths as keys.
   */
  fields: Record<string, Field['_f']>

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
export type Resolver<TForm extends Record<PropertyKey, unknown>, TContext = unknown> = (
  values: TForm,
  context: TContext | undefined,
  options: ResolverOptions<TForm>,
) => unknown
