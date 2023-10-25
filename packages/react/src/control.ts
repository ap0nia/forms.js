import {
  FormControl,
  type ParseForm,
  type FormControlOptions,
  type RegisterOptions,
} from '@forms.js/core'
import type { LiteralUnion } from '@forms.js/core/utils/literal-union'
import { getRuleValue } from '@forms.js/core/validation/get-rule-value'

export type ReactRegisterProps = {
  disabled?: boolean
  name: string
  onBlur: (event: React.ChangeEvent) => Promise<void>
  onChange: (event: React.ChangeEvent) => Promise<void>
  ref: (instance: HTMLElement | null) => void
}

export type { FormControlOptions as ControlOptions }

export class Control<
  TValues extends Record<string, any> = Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
> extends FormControl<TValues, TContext, TTransformedValues, TParsedForm> {
  constructor(options?: FormControlOptions<TValues, TContext>) {
    super(options)
  }

  get _fields() {
    return this.fields
  }

  register<T extends TParsedForm['keys']>(
    name: Extract<T, string>,
    options?: RegisterOptions<TValues, T>,
  ): ReactRegisterProps {
    this.registerField(name, options)

    const onChange = this.onChange.bind(this)

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
          this.registerElement(name, instance as HTMLInputElement)
        } else {
          this.unregisterElement(name)
        }
      },
    }

    return props
  }

  unregister<T extends TParsedForm['keys']>(
    name: LiteralUnion<T, string>,
    options?: RegisterOptions<TValues, T>,
  ): void {
    this.unregisterElement(name, options)
  }

  async onChange(event: React.ChangeEvent) {
    return await this.handleChange(event.nativeEvent)
  }
}
