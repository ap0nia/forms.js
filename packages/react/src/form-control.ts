import {
  FormControl,
  type FormControlOptions,
  type RegisterOptions,
  type SubmitErrorHandler,
  type SubmitHandler,
} from '@forms.js/core'
import type { FlattenObject } from '@forms.js/core/utils/types/flatten-object'
import { getRuleValue } from '@forms.js/core/validation/get-rule-value'

export type { FormControlOptions }

/**
 * Form control with React-specific methods.
 */
export class ReactFormControl<
  TValues extends Record<string, any>,
  TContext = any,
> extends FormControl<TValues, TContext> {
  constructor(options?: FormControlOptions<TValues, TContext>) {
    super(options)
  }

  /**
   * React wrapper for the vanilla register method.
   */
  registerReact<T extends keyof FlattenObject<TValues>>(
    name: Extract<T, string>,
    options?: RegisterOptions<TValues, T>,
  ) {
    const { registerElement, unregisterElement } = this.register(name, options)

    const onChange = this.handleChangeReact.bind(this)

    const props = {
      ...(typeof options?.disabled === 'boolean' && { disabled: options.disabled }),
      ...(this.options.progressive && {
        required: !!options?.required,
        min: getRuleValue(options?.min),
        max: getRuleValue(options?.max),
        minLength: getRuleValue(options?.minLength) as number,
        maxLength: getRuleValue(options?.maxLength) as number,
        pattern: getRuleValue(options?.pattern) as string,
      }),
      name,
      onBlur: onChange,
      onChange,
      ref: (instance: HTMLElement | null) => {
        if (instance) {
          registerElement(instance as HTMLInputElement)
        } else {
          unregisterElement()
        }
      },
    }

    return props
  }

  /**
   * React wrapper for the vanilla handleChange method.
   */
  async handleChangeReact(event: React.ChangeEvent) {
    return await this.handleChange(event.nativeEvent)
  }

  /**
   * React wrapper for the vanilla handleSubmit method.
   */
  handleSubmitReact(onValid?: SubmitHandler<TValues>, onInvalid?: SubmitErrorHandler<TValues>) {
    const handler = this.handleSubmit(onValid, onInvalid)
    return async (event: React.SyntheticEvent) => {
      return await handler(event.nativeEvent)
    }
  }
}
