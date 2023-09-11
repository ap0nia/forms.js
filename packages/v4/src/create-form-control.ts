import { safeGetMultiple } from './utils/safe-get'

export type FormControlOptions<TValues extends Record<string, any>, TContext = any> = {
  values?: TValues
  context?: TContext
}

export class FormControl<TValues extends Record<string, any>, TContext = any> {
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

  // getValues<T extends FieldName<TFieldValues>>(fieldName: T): FlattenObject<TFieldValues>[T]

  // getValues<T extends FieldName<TFieldValues>[]>(
  //   names: readonly [...T],
  // ): RecordKeyMapper<FlattenObject<TFieldValues>, T>

  // getValues<T extends FieldName<TFieldValues>[]>(
  //   ...names: readonly [...T]
  // ): RecordKeyMapper<FlattenObject<TFieldValues>, T>

  getValues(...fieldNames: any): any {
    const names = fieldNames.length > 1 ? fieldNames : fieldNames[0]
    return safeGetMultiple(this.values, names)
  }
}
