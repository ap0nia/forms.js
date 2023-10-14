import { Writable } from '@forms.js/common/store'

import { FormControl } from './form-control'
import { getDirtyFields } from './logic/fields/get-dirty-fields'
import type { RegisterOptions } from './types/register'
import type { Validate } from './types/validation'
import { deepSet } from './utils/deep-set'
import { generateId } from './utils/generate-id'
import { safeGet } from './utils/safe-get'
import { safeUnset } from './utils/safe-unset'
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

/**
 * Field array focus options.
 */
export type FieldArrayMethodProps = {
  /**
   * Whether to toggle focus on and off.
   */
  shouldFocus?: boolean

  /**
   * Set focus by either field index.
   */
  focusIndex?: number

  /**
   * Set focus by field name.
   */
  focusName?: string
}

export class FieldArray<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TFieldArray extends NestedObjectArrays<TValues> = NestedObjectArrays<TValues>,
  TFieldArrayName extends Extract<keyof TFieldArray, string> = Extract<keyof TFieldArray, string>,
  TFieldArrayValue extends TFieldArray[TFieldArrayName] = TFieldArray[TFieldArrayName],
> {
  ids: string[] = []

  fields = new Writable<TFieldArrayValue>()

  focus?: string

  constructor(
    public options: FieldArrayOptions<
      TValues,
      TContext,
      TTransformedValues,
      TFieldArray,
      TFieldArrayName
    >,
    public name = options.name,
    public control = options.control,
  ) {}

  getControlFieldArrayValues(): TFieldArrayValue {
    const controlFieldArrayValues =
      safeGet(
        this.control.state.status.value.mount
          ? this.control.state.values.value
          : this.control.state.defaultValues.value,
        this.options.name,
      ) ?? this.control.options.shouldUnregister
        ? safeGet(this.control.state.defaultValues.value, this.options.name) ?? []
        : []

    return controlFieldArrayValues as TFieldArrayValue
  }

  /**
   * Update state in the form control.
   */
  updateFormControl(
    mutateArray: (args: any[]) => any[],
    shouldSetValues = true,
    shouldUpdateFieldsAndState = true,
  ) {
    // _state.action = true

    const field = safeGet(this.control.fields, this.name)

    if (shouldUpdateFieldsAndState && Array.isArray(field)) {
      const fieldValues = mutateArray(field)

      if (shouldSetValues) {
        deepSet(this.control.fields, this.name, fieldValues)
      }
    }

    const errors = safeGet(this.control.state.errors.value, this.name)

    if (shouldUpdateFieldsAndState && Array.isArray(errors)) {
      const newErrors = mutateArray(errors)

      this.control.state.errors.update((currentErrors) => {
        if (shouldSetValues) {
          deepSet(currentErrors, this.name, newErrors)
        }

        unsetEmptyArray(currentErrors, this.name)

        return currentErrors
      })
    }

    const touchedFields = safeGet(this.control.state.touchedFields.value, this.name)

    if (
      shouldUpdateFieldsAndState &&
      Array.isArray(touchedFields) &&
      this.control.derivedState.isTracking('touchedFields')
    ) {
      const newTouchedFields = mutateArray(touchedFields)

      if (shouldSetValues) {
        this.control.state.touchedFields.update((currentTouchedFields) => {
          deepSet(currentTouchedFields, this.name, newTouchedFields)
          return currentTouchedFields
        })
      }
    }

    if (this.control.derivedState.isTracking('dirtyFields')) {
      this.control.state.dirtyFields.update((currentDirtyFields) => {
        getDirtyFields(this.control.state.defaultValues.value, this.control.state.values.value)
        return currentDirtyFields
      })
    }
  }

  append(
    value: Partial<TFieldArrayValue[number]> | Partial<TFieldArrayValue>,
    options?: FieldArrayMethodProps,
  ) {
    const valueClone = structuredClone(value)

    const valuesArray = (Array.isArray(valueClone) ? valueClone : [valueClone]).filter(Boolean)

    const updatedFieldArrayValues = [...this.getControlFieldArrayValues(), ...valuesArray]

    this.focus = getFocusFieldName(this.name, updatedFieldArrayValues.length - 1, options)

    this.ids.push(...valuesArray.map(generateId))

    this.control.state.values.update((currentValues) => {
      deepSet(currentValues, this.name, updatedFieldArrayValues)
      return currentValues
    })

    this.fields.set(updatedFieldArrayValues as any)

    this.updateFormControl((args) => {
      args.push(...valuesArray.map(() => undefined))
      return args
    })
  }

  prepend(
    value: Partial<TFieldArrayValue[number]> | Partial<TFieldArrayValue>,
    options?: FieldArrayMethodProps,
  ) {
    const valueClone = structuredClone(value)

    const valuesArray = (Array.isArray(valueClone) ? valueClone : [valueClone]).filter(Boolean)

    const updatedFieldArrayValues = [...valuesArray, ...this.getControlFieldArrayValues()]

    this.focus = getFocusFieldName(this.name, updatedFieldArrayValues.length - 1, options)

    this.ids = valuesArray.map(generateId).concat(this.ids)

    this.control.state.values.update((currentValues) => {
      deepSet(currentValues, this.name, updatedFieldArrayValues)
      return currentValues
    })

    this.fields.set(updatedFieldArrayValues as any)

    this.updateFormControl((args) => {
      valuesArray.map(() => undefined).concat(args)
      return args
    })
  }

  remove(index?: number | number[]) {
    const indexArray = Array.isArray(index) ? index : index != null ? [index] : undefined

    const updatedFieldArrayValues =
      indexArray == null
        ? []
        : Array.from(this.getControlFieldArrayValues()).filter((_, i) => !indexArray.includes(i))

    this.ids = this.ids.filter((_, i) => !indexArray?.includes(i))

    this.control.state.values.update((currentValues) => {
      deepSet(currentValues, this.name, updatedFieldArrayValues)
      return currentValues
    })

    this.fields.set(updatedFieldArrayValues as any)

    this.updateFormControl((args) => {
      return args.filter((_, i) => !indexArray?.includes(i))
    })
  }

  insert(
    index: number,
    value: Partial<TFieldArrayValue[number]> | Partial<TFieldArrayValue>,
    options?: FieldArrayMethodProps,
  ) {
    const valueClone = structuredClone(value)

    const valuesArray = (Array.isArray(valueClone) ? valueClone : [valueClone]).filter(Boolean)

    const currentFieldArrayValues = Array.from(this.getControlFieldArrayValues())

    const updatedFieldArrayValues = [
      ...currentFieldArrayValues.slice(0, index),
      ...valuesArray,
      ...currentFieldArrayValues.slice(index),
    ]

    this.focus = getFocusFieldName(this.name, index, options)

    this.ids.splice(index, 0, ...valuesArray.map(generateId))

    this.control.state.values.update((currentValues) => {
      deepSet(currentValues, this.name, updatedFieldArrayValues)
      return currentValues
    })

    this.fields.set(updatedFieldArrayValues as any)

    this.updateFormControl((args) => {
      args.splice(index, 0, ...valuesArray.map(() => undefined))
      return args
    })
  }

  swap() {}

  move() {}

  update() {}

  replace() {}
}

function unsetEmptyArray<T>(ref: T, name: string) {
  if (!safeGet<any[]>(ref, name).filter(Boolean).length) {
    safeUnset(ref, name)
  }
}

function getFocusFieldName(
  name: string,
  index: number,
  options: FieldArrayMethodProps = {},
): string {
  return options.shouldFocus || options.shouldFocus == null
    ? options.focusName || `${name}.${options.focusIndex == null ? index : options.focusIndex}.`
    : ''
}

export type MyForm = {
  a: string
  b: {
    c: number
  }
  d: string[]
  e: {
    f: {
      g: boolean
    }[]
  }[]
}

const control = new FormControl<MyForm>()

export const fieldArray = new FieldArray({ name: 'e', control })
