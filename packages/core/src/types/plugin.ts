import type { FormControl } from '../form-control'

/**
 * Plugin system for invoking arbitrary hooks during the form control's lifecyle.
 *
 * @experimental
 */
export type Plugin<TValues extends Record<string, any>, TContext = any> = {
  /**
   * Runs directly after all the properties are initialized in the constructor.
   *
   * A caveat is default values may not be set yet if they're asynchronous.
   */
  onInit?: (formControl: FormControl<TValues, TContext>) => unknown

  /**
   * TODO: on validate, i.e. like a resolver.
   */
}
