import { Writable } from '@forms.js/common/store'

import { VALIDATION_MODE } from './constants'
import { FormControl } from './form-control'
import { getDirtyFields } from './logic/fields/get-dirty-fields'
import { iterateFieldsByAction } from './logic/fields/iterate-fields-by-action'
import { getValidationModes } from './logic/validation/get-validation-modes'
import { nativeValidateSingleField } from './logic/validation/native-validation'
import type { Field, FieldReference } from './types/fields'
import type { RegisterOptions } from './types/register'
import type { Validate } from './types/validation'
import { deepSet } from './utils/deep-set'
import { deepUnset } from './utils/deep-unset'
import { generateId } from './utils/generate-id'
import { isEmptyObject } from './utils/is-object'
import { safeGet } from './utils/safe-get'
import { safeUnset } from './utils/safe-unset'
import type { NestedObjectArrays } from './utils/types/nested-object-arrays'

export type FieldArrayOptions<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TFieldArray extends NestedObjectArrays<TValues> = NestedObjectArrays<TValues>,
  TFieldArrayName extends Extract<keyof TFieldArray, string> = Extract<keyof TFieldArray, string>,
> = {
  name: TFieldArrayName
  control: FormControl<TValues, TContext, TTransformedValues>
  shouldUnregister?: boolean
  rules?: {
    validate?:
      | Validate<FieldArray<TValues, TFieldArrayName>[], TValues>
      | Record<string, Validate<FieldArray<TValues, TFieldArrayName>[], TValues>>
  } & Pick<RegisterOptions<TValues>, 'maxLength' | 'minLength' | 'required'>
  idGenerator?: () => string
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

  /**
   * The value of this field array.
   */
  value: Writable<TFieldArrayValue>

  /**
   * Props for each field in the field array.
   */
  fields: Writable<{ [K in keyof TFieldArrayValue]: TFieldArrayValue[K] & { id: string } }>

  focus?: string

  /**
   * Whether an action is currently being performed.
   */
  action = new Writable(false)

  name: TFieldArrayName

  control: FormControl<TValues, TContext, TTransformedValues>

  idGenerator: () => string

  constructor(
    public options: FieldArrayOptions<
      TValues,
      TContext,
      TTransformedValues,
      TFieldArray,
      TFieldArrayName
    >,
  ) {
    this.name = options.name

    this.control = options.control

    this.value = new Writable<TFieldArrayValue>(
      Array.from(safeGet(this.control.state.values.value, this.name) ?? []) as any,
    )

    this.idGenerator = options.idGenerator ?? generateId

    this.fields = new Writable<TFieldArrayValue>(this.getFieldArray(), (set) => {
      const unsubscribe = this.value.subscribe(
        (value) => {
          if (value == null) {
            return
          }

          const newFields: any = Array.from(value).map((v, i) => {
            this.ids[i] ??= this.idGenerator()
            return { ...(v ?? undefined), id: this.ids[i] }
          })

          set(newFields)
        },
        undefined,
        false,
      )

      this.control.resetListeners.push(() => {
        const newFields: any = Array.from(this.getFieldArray()).map((v, i) => {
          this.ids[i] = this.idGenerator()
          return { ...(v ?? undefined), id: this.ids[i] }
        })
        set(newFields)
      })

      return unsubscribe
    })
  }

  getControlFieldArrayValues(): TFieldArrayValue {
    const controlFieldArrayValues =
      safeGet(
        this.control.state.status.value.mount
          ? this.control.state.values.value
          : this.control.state.defaultValues.value,
        this.name,
      ) ??
      (this.control.options.shouldUnregister
        ? safeGet(this.control.state.defaultValues.value, this.name) ?? []
        : [])

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

      this.control.state.errors.update(
        (currentErrors) => {
          if (shouldSetValues) {
            deepSet(currentErrors, this.name, newErrors)
          }

          unsetEmptyArray(currentErrors, this.name)

          return currentErrors
        },
        [this.name],
      )
    }

    const touchedFields = safeGet(this.control.state.touchedFields.value, this.name)

    if (
      shouldUpdateFieldsAndState &&
      Array.isArray(touchedFields) &&
      this.control.derivedState.isTracking('touchedFields')
    ) {
      const newTouchedFields = mutateArray(touchedFields)

      if (shouldSetValues) {
        this.control.state.touchedFields.update(
          (currentTouchedFields) => {
            deepSet(currentTouchedFields, this.name, newTouchedFields)
            return currentTouchedFields
          },
          [this.name],
        )
      }
    }

    if (this.control.derivedState.isTracking('dirtyFields')) {
      this.control.state.dirtyFields.set(
        getDirtyFields(this.control.state.defaultValues.value, this.control.state.values.value),
        [this.name],
      )
    }
  }

  append(
    value: Partial<TFieldArrayValue[number]> | Partial<TFieldArrayValue>,
    options?: FieldArrayMethodProps,
  ) {
    this.control.derivedState.freeze()

    const valueClone = structuredClone(value)

    const valuesArray = (Array.isArray(valueClone) ? valueClone : [valueClone]).filter(Boolean)

    const updatedFieldArrayValues = [...this.getControlFieldArrayValues(), ...valuesArray]

    this.focus = getFocusFieldName(this.name, updatedFieldArrayValues.length - 1, options)

    this.ids.push(...valuesArray.map(this.idGenerator.bind(this)))

    this.action.set(true)

    this.control.state.values.update(
      (currentValues) => {
        deepSet(currentValues, this.name, updatedFieldArrayValues)
        return currentValues
      },
      [this.name],
    )

    this.value.set(updatedFieldArrayValues as any)

    this.updateFormControl((args) => {
      args.push(...valuesArray.map(() => undefined))
      return args
    })

    this.control.derivedState.unfreeze()
  }

  prepend(
    value: Partial<TFieldArrayValue[number]> | Partial<TFieldArrayValue>,
    options?: FieldArrayMethodProps,
  ) {
    this.control.derivedState.freeze()

    const valueClone = structuredClone(value)

    const valuesArray = (Array.isArray(valueClone) ? valueClone : [valueClone]).filter(Boolean)

    const updatedFieldArrayValues = [...valuesArray, ...this.getControlFieldArrayValues()]

    this.focus = getFocusFieldName(this.name, updatedFieldArrayValues.length - 1, options)

    this.ids = valuesArray.map(this.idGenerator.bind(this)).concat(this.ids)

    this.action.set(true)

    this.control.state.values.update(
      (currentValues) => {
        deepSet(currentValues, this.name, updatedFieldArrayValues)
        return currentValues
      },
      [this.name],
    )

    this.value.set(updatedFieldArrayValues as any)

    this.updateFormControl((args) => {
      valuesArray.map(() => undefined).concat(args)
      return args
    })

    this.control.derivedState.unfreeze()
  }

  remove(index?: number | number[]) {
    this.control.derivedState.freeze()

    const indexArray = Array.isArray(index) ? index : index != null ? [index] : undefined

    const updatedFieldArrayValues =
      indexArray == null
        ? []
        : Array.from(this.getControlFieldArrayValues()).filter((_, i) => !indexArray.includes(i))

    this.ids = this.ids.filter((_, i) => !indexArray?.includes(i))

    this.action.set(true)

    this.control.state.values.update(
      (currentValues) => {
        deepSet(currentValues, this.name, updatedFieldArrayValues)
        return currentValues
      },
      [this.name],
    )

    this.action.set(true)

    this.value.set(updatedFieldArrayValues as any)

    this.updateFormControl((args) => {
      return args.filter((_, i) => !indexArray?.includes(i))
    })

    this.control.derivedState.unfreeze()
  }

  insert(
    index: number,
    value: Partial<TFieldArrayValue[number]> | Partial<TFieldArrayValue>,
    options?: FieldArrayMethodProps,
  ) {
    this.control.derivedState.freeze()

    const valueClone = structuredClone(value)

    const valuesArray = (Array.isArray(valueClone) ? valueClone : [valueClone]).filter(Boolean)

    const currentFieldArrayValues = Array.from(this.getControlFieldArrayValues())

    const updatedFieldArrayValues = [
      ...currentFieldArrayValues.slice(0, index),
      ...valuesArray,
      ...currentFieldArrayValues.slice(index),
    ]

    this.focus = getFocusFieldName(this.name, index, options)

    this.ids.splice(index, 0, ...valuesArray.map(this.idGenerator.bind(this)))

    this.action.set(true)

    this.control.state.values.update(
      (currentValues) => {
        deepSet(currentValues, this.name, updatedFieldArrayValues)
        return currentValues
      },
      [this.name],
    )

    this.value.set(updatedFieldArrayValues as any)

    this.updateFormControl((args) => {
      args.splice(index, 0, ...valuesArray.map(() => undefined))
      return args
    })

    this.control.derivedState.unfreeze()
  }

  swap(left: number, right: number) {
    this.control.derivedState.freeze()

    const updatedFieldArrayValues = Array.from(this.getControlFieldArrayValues())

    const leftValue = updatedFieldArrayValues[left]
    const rightValue = updatedFieldArrayValues[right]

    updatedFieldArrayValues[left] = rightValue
    updatedFieldArrayValues[right] = leftValue

    this.action.set(true)

    this.control.state.values.update(
      (currentValues) => {
        deepSet(currentValues, this.name, updatedFieldArrayValues)
        return currentValues
      },
      [this.name],
    )

    this.value.set(updatedFieldArrayValues as any)

    this.updateFormControl((args) => {
      const leftArg = args[left]
      const rightArg = args[right]

      args[left] = rightArg
      args[right] = leftArg

      return args
    })

    this.control.derivedState.unfreeze()
  }

  move(from: number, to: number) {
    this.control.derivedState.freeze()

    const updatedFieldArrayValues = Array.from(this.getControlFieldArrayValues())

    const value = updatedFieldArrayValues[from]

    updatedFieldArrayValues.splice(from, 1)
    updatedFieldArrayValues.splice(to, 0, value)

    this.action.set(true)

    this.control.state.values.update(
      (currentValues) => {
        deepSet(currentValues, this.name, updatedFieldArrayValues)
        return currentValues
      },
      [this.name],
    )

    this.value.set(updatedFieldArrayValues as any)

    this.updateFormControl((args) => {
      args.splice(from, 1)
      args.splice(to, 0, undefined)

      return args
    })

    this.control.derivedState.unfreeze()
  }

  update(index: number, value: TFieldArrayValue[number]) {
    this.control.derivedState.freeze()

    const updatedFieldArrayValues = Array.from(this.getControlFieldArrayValues())

    updatedFieldArrayValues[index] = value

    this.action.set(true)

    this.control.state.values.update((currentValues) => {
      deepSet(currentValues, this.name, updatedFieldArrayValues)
      return currentValues
    })

    this.value.set(updatedFieldArrayValues as any)

    this.updateFormControl((args) => {
      args[index] = undefined
      return args
    })

    this.control.derivedState.unfreeze()
  }

  replace(value: Partial<TFieldArrayValue[number]> | Partial<TFieldArrayValue>) {
    this.control.derivedState.freeze()

    const valueClone = structuredClone(value)

    const valuesArray = (Array.isArray(valueClone) ? valueClone : [valueClone]).filter(Boolean)

    this.ids = valuesArray.map(this.idGenerator.bind(this))

    this.action.set(true)

    this.control.state.values.update(
      (currentValues) => {
        deepSet(currentValues, this.name, valuesArray)
        return currentValues
      },
      [this.name],
    )

    this.value.set(valuesArray as any)

    this.updateFormControl(() => [])

    this.control.derivedState.unfreeze()
  }

  /**
   * Whenever the field array's fields changes, update the form control.
   */
  createSubscription(): () => void {
    const unsubscribe = this.fields.subscribe(
      () => {
        this.control.derivedState.freeze()

        this.validate()

        const focus = this.focus

        if (focus) {
          iterateFieldsByAction(this.control.fields, (ref, key: string) => {
            if (key.startsWith(focus)) {
              ref.focus?.()
            }
          })
        }

        this.focus = ''

        this.control.updateValid()

        this.action.set(false)

        this.control.derivedState.unfreeze()
      },
      undefined,
      false,
    )

    return unsubscribe
  }

  async validate(fields = this.control.fields) {
    const submitted =
      !getValidationModes(this.control.options.mode).submit || this.control.state.isSubmitted.value

    if (!this.action.value || !submitted) {
      return
    }

    if (this.control.options.resolver) {
      const fieldsToValidate: Record<string, FieldReference> = {}

      for (const name in fields) {
        const field: Field | undefined = safeGet(fields, name)

        if (field?._f) {
          fieldsToValidate[name] = field._f
        }
      }

      const result = await this.control.options.resolver(
        this.control.state.values.value,
        this.control.options.context,
        {
          names: [this.name] as any,
          fields: fieldsToValidate,
          criteriaMode: this.control.options.criteriaMode,
          shouldUseNativeValidation: this.control.options.shouldUseNativeValidation,
        },
      )

      const error = safeGet(result.errors, this.name)

      const existingError = safeGet(this.control.state.errors.value, this.name)

      const errorChanged = existingError
        ? (!error && existingError.type) ||
          (error && (existingError.type !== error.type || existingError.message !== error.message))
        : error && error.type

      if (errorChanged) {
        this.control.state.errors.update((currentErrors) => {
          if (error) {
            deepSet(currentErrors, this.name, error)
          } else {
            deepUnset(currentErrors, this.name)
          }
          return currentErrors
        })
      }

      return
    }

    const field: Field | undefined = safeGet(fields, this.name)

    if (field?._f == null) {
      return
    }

    const result = await nativeValidateSingleField(
      field,
      this.control.state.values.value,
      this.control.options.criteriaMode === VALIDATION_MODE.all,
      this.control.options.shouldUseNativeValidation,
      true,
    )

    if (!isEmptyObject(result)) {
      this.control.state.errors.update((currentErrors) => {
        const fieldArrayErrors = (safeGet(currentErrors, this.name) ?? []).filter(Boolean)

        deepSet(fieldArrayErrors, 'root', result[this.name])

        deepSet(currentErrors, this.name, fieldArrayErrors)

        return currentErrors
      })
    }
  }

  mount() {
    this.control.names.array.add(this.name)
  }

  unmount() {
    if (this.control.options.shouldUnregister || this.options.shouldUnregister) {
      this.control.unregister(this.name as any)
    }
  }

  getFieldArray(): any {
    const valueFromControl = safeGet(
      this.control.state.status.value.mount
        ? this.control.state.values.value
        : this.control.state.defaultValues.value,
      this.name,
    )

    const fallbackValue =
      (this.control.options.shouldUnregister
        ? safeGet(this.control.state.defaultValues.value, this.name)
        : []) ?? []

    const value: any[] = valueFromControl ?? fallbackValue

    const fieldArray: any = value.map((v, i) => {
      const id = this.ids[i] ?? v?.id ?? this.idGenerator()

      this.ids[i] = id

      return { ...v, id }
    })

    return fieldArray
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

function unsetEmptyArray<T>(ref: T, name: string) {
  if (!safeGet<any[]>(ref, name).filter(Boolean).length) {
    safeUnset(ref, name)
  }
}
