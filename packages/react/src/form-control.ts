import {
  FormControl as CoreFormControl,
  type ParseForm,
  type FormControlOptions,
} from '@forms.js/core'

export type ReactRegisterProps = {}

export class FormControl<
  TValues extends Record<string, any> = Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
> extends CoreFormControl<TValues, TContext, TTransformedValues, TParsedForm> {
  constructor(options?: FormControlOptions<TValues, TContext>) {
    super(options)
  }
}
