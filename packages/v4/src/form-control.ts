import { safeGetMultiple } from './utils/safe-get'
import type { MapObjectKeys } from './utils/types/map-object-keys'
import type { ParsedForm } from './utils/types/parsed-form'

export type FormControlOptions<TValues extends Record<string, any>, TContext = any> = {
  values?: TValues
  context?: TContext
}

export class FormControl<
  TValues extends Record<string, any>,
  TContext = any,
  TParsedForm extends ParsedForm<TValues> = ParsedForm<TValues>,
> {
  defaultValues: Partial<TValues>

  values: TValues

  context: TContext

  constructor(options?: FormControlOptions<TValues, TContext>) {
    const defaultValues = (options?.values ?? {}) as TValues

    this.defaultValues = defaultValues
    this.values = defaultValues
    this.context = {} as TContext
  }

  getValues(): TValues

  getValues<T extends TParsedForm['keys']>(fieldName: T): TParsedForm['flattened'][T]

  getValues<T extends TParsedForm['keys'][]>(
    names: readonly [...T],
  ): MapObjectKeys<TParsedForm['flattened'], T>

  getValues<T extends TParsedForm['keys'][]>(
    ...names: readonly [...T]
  ): MapObjectKeys<TParsedForm['flattened'], T>

  getValues(...fieldNames: any): any {
    const names = fieldNames.length > 1 ? fieldNames : fieldNames[0]
    return safeGetMultiple(this.values, names)
  }
}
