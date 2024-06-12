import {
  FormControl,
  type ParseForm,
  type FormControlOptions,
  type RegisterOptions,
} from '@forms.js/core'
import { getRuleValue } from '@forms.js/core/validation/get-rule-value'

export type ReactRegisterProps<TFieldName> = {
  disabled?: boolean
  name: TFieldName
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
  constructor(options?: FormControlOptions<TValues, TContext, TParsedForm>) {
    super(options)
  }

  register<T extends keyof TParsedForm>(
    name: T,
    options?: RegisterOptions<TValues, TParsedForm, T>,
  ): ReactRegisterProps<T> {
    this.registerField(name, options)

    const onChange = async (event: React.ChangeEvent) => {
      return await this.onChange(event.nativeEvent)
    }

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
          this.unregisterField(name)
        }
      },
    }

    return props
  }
}
