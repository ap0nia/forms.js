import { FormControl } from './form-control'
import type { RegisterOptions } from './types/register'
import type { Validate } from './types/validation'
import type { NestedObjectArrays } from './utils/types/nested-object-arrays'

export type FieldArrayOptions<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TFieldArray extends NestedObjectArrays<TValues> = NestedObjectArrays<TValues>,
  TFieldArrayName extends keyof TFieldArray = keyof TFieldArray,
> = {
  name: TFieldArrayName
  control: FormControl<TValues, TContext, TTransformedValues>
  shouldUnregister?: boolean
  rules?: {
    validate?:
      | Validate<FieldArray<TValues, TFieldArrayName>[], TValues>
      | Record<string, Validate<FieldArray<TValues, TFieldArrayName>[], TValues>>
  } & Pick<RegisterOptions<TValues>, 'maxLength' | 'minLength' | 'required'>
}

export class FieldArray<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TFieldArray extends NestedObjectArrays<TValues> = NestedObjectArrays<TValues>,
  TFieldArrayName extends keyof TFieldArray = keyof TFieldArray,
> {
  constructor(
    public options: FieldArrayOptions<
      TValues,
      TContext,
      TTransformedValues,
      TFieldArray,
      TFieldArrayName
    >,
    public control = options.control,
  ) {}

  append() {}

  prepend() {}

  remove() {}

  insert() {}

  swap() {}

  move() {}

  update() {}

  replace() {}
}

// export type MyForm = {
//   a: string
//   b: {
//     c: number
//   }
//   d: string[]
//   e: {
//     f: {
//       g: boolean
//     }[]
//   }[]
// }
