import { Writable } from '@hookform/common/store'
import { get } from '@hookform/common/utils/get'
import { isEmptyObject } from '@hookform/common/utils/is-empty-object'
import { set } from '@hookform/common/utils/set'
import { unset } from '@hookform/common/utils/unset'

import { VALIDATION_EVENTS } from './constants'
import type { FormControl } from './form-control'
import { getDirtyFields } from './logic/fields/get-dirty-fields'
import getFocusFieldName from './logic/fields/get-focus-field-name'
import { iterateFieldsByAction } from './logic/fields/iterate-fields-by-action'
import { getValidationModes } from './logic/validation/get-validation-modes'
import nativeValidateSingleField from './logic/validation/native-validation'
import type { FieldError } from './types/errors'
import type { Field, FieldReference } from './types/fields'
import type { ParseForm } from './types/parse'
import type { RegisterOptions } from './types/register'
import type { Validate } from './types/validation'
import generateId from './utils/generate-id'
import type { NestedObjectArrays } from './utils/nested-object-arrays'

/**
 * Parses a form into its flattened keys and values and filters by field values.
 *
 * Takes raw field values and flattens them before filtering.
 */
export type ParseFieldArray<T, TParsedForm = ParseForm<T>> = NestedObjectArrays<TParsedForm>

export type FieldArrayOptions<
  TFieldValues extends Record<string, any>,
  TFieldArrayName extends keyof ParseFieldArray<TFieldValues> = keyof ParseFieldArray<TFieldValues>,
  TKeyName extends string = 'id',
> = {
  name: TFieldArrayName

  keyName?: TKeyName

  control: FormControl<TFieldValues>

  shouldUnregister?: boolean

  rules?: {
    validate?:
      | Validate<ParseForm<TFieldValues>[TFieldArrayName], TFieldValues>
      | Record<string, Validate<ParseForm<TFieldValues>[TFieldArrayName], TFieldValues>>
  } & Pick<RegisterOptions<TFieldValues>, 'maxLength' | 'minLength' | 'required'>

  generateId?: () => string
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
  TFieldValues extends Record<string, any>,
  TFieldArrayName extends keyof ParseFieldArray<TFieldValues> = keyof ParseFieldArray<TFieldValues>,
  TKeyName extends string = 'id',
  TParsedFieldArray extends ParseFieldArray<TFieldValues> = ParseFieldArray<TFieldValues>,
  TFieldArrayValue extends TParsedFieldArray[TFieldArrayName] = TParsedFieldArray[TFieldArrayName],
> {
  ids: string[] = []

  /**
   * The value of this field array.
   */
  value: Writable<TFieldArrayValue>

  /**
   * Props for each field in the field array.
   */
  fields: Writable<(TFieldArrayValue[number] & Record<TKeyName, string>)[]>

  /**
   */
  focus?: string

  /**
   * Whether an action is currently being performed.
   */
  action = new Writable(false)

  name: TFieldArrayName

  control: FormControl<TFieldValues, any, any>

  generateId: () => string

  constructor(public options: FieldArrayOptions<TFieldValues, TFieldArrayName, TKeyName>) {
    this.name = options.name

    this.control = options.control

    const currentValue = get(this.control._formValues, this.name, [])

    this.value = new Writable(Array.from(currentValue) as any)

    this.generateId = options.generateId ?? generateId

    this.fields = new Writable(this.getFieldArray(), (set) => {
      const unsubscribe = this.value.subscribe(
        (value) => {
          if (value == null) return

          const newFields: any = Array.from(value as any).map((v, i) => {
            this.ids[i] ??= this.generateId()
            return { ...(v ?? undefined), id: this.ids[i] }
          })

          set(newFields)
        },
        undefined,
        false,
      )

      this.control.valueListeners.push(() => {
        const newFields: any = Array.from(this.getFieldArray()).map((v, i) => {
          // NOTE: do NOT nullish coalesce this. Force generate a new number...
          this.ids[i] = this.generateId()
          return { ...(v ?? undefined), id: this.ids[i] }
        })
        set(newFields)
      })

      return unsubscribe
    })
  }

  getControlFieldArrayValues(): TFieldArrayValue {
    const controlFieldArrayValues =
      get(
        this.control.mounted ? this.control._formValues : this.control._defaultValues,
        this.name,
      ) ??
      (this.control.options.shouldUnregister
        ? get(this.control._defaultValues, this.name) ?? []
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
    this.control.state.open()

    const field = get(this.control.fields, this.name)

    if (shouldUpdateFieldsAndState && Array.isArray(field)) {
      const fieldValues = mutateArray(field)

      if (shouldSetValues) {
        set(this.control.fields, this.name, fieldValues)
      }
    }

    const errors = get(this.control._formState.errors, this.name)

    if (shouldUpdateFieldsAndState && Array.isArray(errors)) {
      const newErrors = mutateArray(errors)

      this.control.stores.errors.update((currentErrors) => {
        if (shouldSetValues) {
          set(currentErrors, this.name, newErrors)
        }

        const existingErrors: FieldError[] | undefined = get(currentErrors, this.name)

        if (!Array.isArray(existingErrors) || !existingErrors.filter(Boolean).length) {
          unset(currentErrors, this.name)
        }

        return currentErrors
      }, this.name)
    }

    const touchedFields = get(this.control.stores.touchedFields.value, this.name)

    if (
      shouldUpdateFieldsAndState &&
      Array.isArray(touchedFields) &&
      this.control.isTracking('touchedFields', this.name)
    ) {
      const newTouchedFields = mutateArray(touchedFields)

      if (shouldSetValues) {
        this.control.stores.touchedFields.update((currentTouchedFields) => {
          set(currentTouchedFields, this.name, newTouchedFields)
          return currentTouchedFields
        }, this.name)
      }
    }

    if (this.control.isTracking('dirtyFields', this.name)) {
      this.control.stores.dirtyFields.set(
        getDirtyFields(this.control._defaultValues, this.control._formValues),
        this.name,
      )
    }

    this.control.stores.isDirty.set(this.control.getDirty(), this.name)

    this.control.state.flush()
  }

  append(
    value: Partial<TFieldArrayValue[number]> | Partial<TFieldArrayValue>,
    options?: FieldArrayMethodProps,
  ) {
    this.control.state.open()

    const valueClone = structuredClone(value)

    const valuesArray = (Array.isArray(valueClone) ? valueClone : [valueClone]).filter(Boolean)

    const updatedFieldArrayValues = [...this.getControlFieldArrayValues(), ...valuesArray]

    this.focus = getFocusFieldName(this.name, updatedFieldArrayValues.length - 1, options)

    this.ids.push(...valuesArray.map(this.generateId.bind(this)))

    this.action.set(true)
    this.control.action.set(true)

    this.control.stores.values.update((currentValues) => {
      set(currentValues, this.name, updatedFieldArrayValues)
      return currentValues
    }, this.name)

    this.value.set(updatedFieldArrayValues as any)

    this.updateFormControl((args) => {
      args.push(...valuesArray.map(() => undefined))
      return args
    })

    this.control.state.flush()
  }

  prepend(
    value: Partial<TFieldArrayValue[number]> | Partial<TFieldArrayValue>,
    options?: FieldArrayMethodProps,
  ) {
    this.control.state.open()

    const valueClone = structuredClone(value)

    const valuesArray = (Array.isArray(valueClone) ? valueClone : [valueClone]).filter(Boolean)

    const updatedFieldArrayValues = [...valuesArray, ...this.getControlFieldArrayValues()]

    this.focus = getFocusFieldName(this.name, 0, options)

    this.ids = [...valuesArray.map(this.generateId.bind(this)), ...this.ids]

    this.action.set(true)
    this.control.action.set(true)

    this.control.stores.values.update((currentValues) => {
      set(currentValues, this.name, updatedFieldArrayValues)
      return currentValues
    }, this.name)

    this.value.set(updatedFieldArrayValues as any)

    this.updateFormControl((args) => {
      return [...valuesArray.map(() => undefined), ...args]
    })

    this.control.state.flush()
  }

  remove(index?: number | number[]) {
    this.control.state.open()

    const indexArray = Array.isArray(index) ? index : index != null ? [index] : undefined

    const updatedFieldArrayValues =
      indexArray == null
        ? []
        : Array.from(this.getControlFieldArrayValues()).filter((_, i) => !indexArray.includes(i))

    this.ids = this.ids.filter((_, i) => !indexArray?.includes(i))

    this.action.set(true)
    this.control.action.set(true)

    this.control.stores.values.update((currentValues) => {
      set(currentValues, this.name, updatedFieldArrayValues)
      return currentValues
    }, this.name)

    this.value.set(updatedFieldArrayValues as any)

    this.updateFormControl((args) => {
      return index == null ? [] : args.filter((_, i) => !indexArray?.includes(i))
    })

    this.control.state.flush()
  }

  insert(
    index: number,
    value: Partial<TFieldArrayValue[number]> | Partial<TFieldArrayValue>,
    options?: FieldArrayMethodProps,
  ) {
    this.control.state.open()

    const valueClone = structuredClone(value)

    const valuesArray = (Array.isArray(valueClone) ? valueClone : [valueClone]).filter(Boolean)

    const currentFieldArrayValues = Array.from(this.getControlFieldArrayValues())

    const updatedFieldArrayValues = [
      ...currentFieldArrayValues.slice(0, index),
      ...valuesArray,
      ...currentFieldArrayValues.slice(index),
    ]

    this.focus = getFocusFieldName(this.name, index, options)

    this.ids.splice(index, 0, ...valuesArray.map(this.generateId.bind(this)))

    this.action.set(true)
    this.control.action.set(true)

    this.control.stores.values.update((currentValues) => {
      set(currentValues, this.name, updatedFieldArrayValues)
      return currentValues
    }, this.name)

    this.value.set(updatedFieldArrayValues as any)

    this.updateFormControl((args) => {
      args.splice(index, 0, ...valuesArray.map(() => undefined))
      return args
    })

    this.control.state.flush()
  }

  swap(left: number, right: number) {
    this.control.state.open()

    const updatedFieldArrayValues = Array.from(this.getControlFieldArrayValues())

    const leftValue = updatedFieldArrayValues[left]
    const rightValue = updatedFieldArrayValues[right]

    updatedFieldArrayValues[left] = rightValue
    updatedFieldArrayValues[right] = leftValue

    this.action.set(true)
    this.control.action.set(true)

    this.control.stores.values.update((currentValues) => {
      set(currentValues, this.name, updatedFieldArrayValues)
      return currentValues
    }, this.name)

    const leftId = this.ids[left] ?? this.generateId()
    const rightId = this.ids[right] ?? this.generateId()

    this.ids[left] = rightId
    this.ids[right] = leftId

    this.value.set(updatedFieldArrayValues as any)

    this.updateFormControl((args) => {
      const leftArg = args[left]
      const rightArg = args[right]

      args[left] = rightArg
      args[right] = leftArg

      return args
    })

    this.control.state.flush()
  }

  move(from: number, to: number) {
    this.control.state.open()

    const updatedValues = Array.from(this.getControlFieldArrayValues())

    updatedValues[to] ??= undefined

    updatedValues.splice(to, 0, updatedValues.splice(from, 1)[0])

    this.action.set(true)
    this.control.action.set(true)

    this.control.stores.values.update((currentValues) => {
      set(currentValues, this.name, updatedValues)
      return currentValues
    }, this.name)

    this.ids[to] ??= this.generateId()
    this.ids.splice(to, 0, this.ids.splice(from, 1)[0] ?? this.generateId())

    this.value.set(updatedValues as any)

    this.updateFormControl((args) => {
      args[to] ??= undefined
      args.splice(to, 0, args.splice(from, 1)[0])
      return args
    })

    this.control.state.flush()
  }

  update(index: number, value: TFieldArrayValue[number]) {
    this.control.state.open()

    const updatedFieldArrayValues = Array.from(this.getControlFieldArrayValues())

    updatedFieldArrayValues[index] = value

    this.action.set(true)
    this.control.action.set(true)

    this.control.stores.values.update((currentValues) => {
      set(currentValues, this.name, updatedFieldArrayValues)
      return currentValues
    }, this.name)

    this.ids = [...updatedFieldArrayValues].map((item, i) =>
      !item || i === index ? this.generateId() : this.ids[i] ?? this.generateId(),
    )

    this.value.set(updatedFieldArrayValues as any)

    this.updateFormControl(
      (args) => {
        args[index] = undefined
        return args
      },
      undefined,
      false,
    )

    this.control.state.flush()
  }

  replace(value: Partial<TFieldArrayValue[number]> | Partial<TFieldArrayValue>) {
    this.control.state.open()

    const valueClone = structuredClone(value)

    const valuesArray = (Array.isArray(valueClone) ? valueClone : [valueClone]).filter(Boolean)

    this.ids = valuesArray.map(this.generateId.bind(this))

    this.action.set(true)
    this.control.action.set(true)

    this.control.stores.values.update((currentValues) => {
      set(currentValues, this.name, valuesArray)
      return currentValues
    }, this.name)

    this.value.set(valuesArray as any)

    this.control.state.flush()
  }

  /**
   * React lifecycle event...
   */
  synchronize() {
    this.control.action.set(false)

    this.control.state.open()

    this.control.stores.values.update((values) => {
      return { ...values }
    }, this.name)

    this.validate()

    const focus = this.focus

    if (focus) {
      iterateFieldsByAction(this.control.fields, (ref, key: string) => {
        if (key.startsWith(focus) && ref.focus) {
          ref.focus()
          return 1
        }
        return
      })
    }

    this.focus = ''

    this.control.updateValid()

    this.action.set(false)

    this.control.state.flush()
  }

  async validate(fields = this.control.fields) {
    const submitted =
      !getValidationModes(this.control.options.mode).onSubmit || this.control._formState.isSubmitted

    if (!this.action.value || !submitted) return

    if (this.control.options.resolver) {
      const fieldsToValidate: Record<string, FieldReference> = {}

      for (const name in fields) {
        const field: Field | undefined = get(fields, name)

        if (field?._f) {
          fieldsToValidate[name] = field._f
        }
      }

      const result = await this.control.options.resolver(
        this.control._formValues,
        this.control.options.context,
        {
          names: [this.name] as any,
          fields: fieldsToValidate,
          criteriaMode: this.control.options.criteriaMode,
          shouldUseNativeValidation: this.control.options.shouldUseNativeValidation,
        },
      )

      const error = get(result.errors, this.name)

      const existingError = get(this.control._formState.errors, this.name)

      const errorChanged = existingError
        ? (!error && existingError.type) ||
          (error && (existingError.type !== error.type || existingError.message !== error.message))
        : error && error.type

      if (errorChanged) {
        this.control.stores.errors.update((currentErrors) => {
          if (error) {
            set(currentErrors, this.name, error)
          } else {
            unset(currentErrors, this.name)
          }
          return currentErrors
        }, this.name)
      }

      return
    }

    const field: Field | undefined = get(fields, this.name)

    if (field?._f == null) {
      return
    }

    const result = await nativeValidateSingleField(
      field,
      this.control._formValues,
      this.control.options.criteriaMode === VALIDATION_EVENTS.all,
      this.control.options.shouldUseNativeValidation,
      true,
    )

    if (!isEmptyObject(result)) {
      this.control.stores.errors.update((currentErrors) => {
        const fieldArrayErrors = (get(currentErrors, this.name) ?? []).filter(Boolean)

        set(fieldArrayErrors, 'root', result[this.name])

        set(currentErrors, this.name, fieldArrayErrors)

        return currentErrors
      }, this.name)
    }
  }

  mount() {
    this.control.names.array.add(this.name.toString())
  }

  unmount() {
    if (this.control.options.shouldUnregister || this.options.shouldUnregister) {
      this.control.unregister(this.name as any)
    }
  }

  getFieldArray(): any {
    const valueFromControl = get(
      this.control.mounted ? this.control._formValues : this.control._defaultValues,
      this.name,
    )

    const fallbackValue =
      (this.control.options.shouldUnregister ? get(this.control._defaultValues, this.name) : []) ??
      []

    const value: any[] = valueFromControl ?? fallbackValue

    const fieldArray: any = value.map((v, i) => {
      const id = this.ids[i] ?? v?.id ?? this.generateId()

      this.ids[i] = id

      return { ...v, id }
    })

    return fieldArray
  }
}
