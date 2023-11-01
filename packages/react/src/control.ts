import {
  FormControl,
  type ParseForm,
  type FormControlOptions,
  type RegisterOptions,
  type UnregisterOptions,
} from '@forms.js/core'
import { getRuleValue } from '@forms.js/core/validation/get-rule-value'

export type ReactRegisterProps = {
  disabled?: boolean
  name: string
  onBlur: (event: React.ChangeEvent) => Promise<void>
  onChange: (event: React.ChangeEvent) => Promise<void>
  ref: (instance: HTMLElement | null) => void

  // Progressive validation props
  required?: boolean
  min?: string | number
  max?: string | number
  minLength?: number
  maxLength?: number
  pattern?: string
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
      ref: this.ref.bind(this, name),
    }

    return props
  }

  ref<T extends TParsedForm['keys']>(name: Extract<T, string>, instance: HTMLElement | null): void {
    if (instance) {
      this.registerElement(name, instance as HTMLInputElement)
    } else {
      this.unregisterElement(name)
    }
  }

  unregister<T extends TParsedForm['keys']>(name?: T | T[], options?: UnregisterOptions): void {
    this.unregisterField(name, options)
  }

  async onChange(event: React.ChangeEvent) {
    return await this.handleChange(event.nativeEvent)
  }
}
