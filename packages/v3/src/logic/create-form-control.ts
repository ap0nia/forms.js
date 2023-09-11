import { observable } from '@legendapp/state'

import { VALIDATION_MODE } from '../constants'
import { isEmptyObject } from '../lib/is-empty-object'
import { isHTMLElement } from '../lib/is-html-element'
import type { DeepPartial } from '../type-utils/deep-partial'
import type { FlattenObject } from '../type-utils/flatten-object'
import type {
  Field,
  FieldName,
  FieldRecord,
  FieldValues,
  InternalFieldName,
  Ref,
} from '../types/fields'
import type {
  FormObservables,
  FormState,
  Names,
  RecordKeyMapper,
  SetValueConfig,
  UseFormProps,
  UseFormRegisterReturn,
  UseFormTrigger,
} from '../types/form'
import type { RegisterOptions } from '../types/validator'
import { deepEqual } from '../utils/deep-equal'
import { deepSet } from '../utils/deep-set'
import { deepUnset } from '../utils/deep-unset'
import { isObject } from '../utils/is-object'
import { safeGet } from '../utils/safe-get'
import { safeGetMultiple } from '../utils/safe-get-multiple'

import { focusFieldBy } from './focus-field-by'
import { getFieldValue, getFieldValueAs } from './get-field-values'
import { getResolverOptions } from './get-resolver-options'
import { updateFieldArrayRootError } from './update-field-array-root-error'
import { updateFieldReference } from './update-field-reference'
import { validateField } from './validate-field'

const defaultProps = {
  mode: VALIDATION_MODE.onSubmit,
  reValidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true,
} as const

export class FormControl<TFieldValues extends FieldValues = FieldValues, TContext = any> {
  /**
   * The root props used to configure the form.
   *
   * Merged with {@link defaultProps}.
   */
  props: UseFormProps<TFieldValues, TContext>

  /**
   * The default values assigned to form fields.
   */
  defaultValues: DeepPartial<TFieldValues>

  /**
   * The current values of the form fields.
   */
  values: TFieldValues

  /**
   * Data about registered fields.
   */
  fields: any

  /**
   * Idk. It's a noop of some sort.
   */
  flushRootRender?: () => void

  /**
   * Idk.
   */
  shouldDisplayAllAssociatedErrors: boolean

  /**
   * Idk.
   */
  names: Names = {
    mount: new Set(),
    unMount: new Set(),
    array: new Set(),
    watch: new Set(),
  }

  /**
   * The current state of the form?
   *
   * TODO, FIXME: I feel that this can be better encapsulated as an enum.
   */
  state = {
    action: false,
    mount: false,
    watch: false,
  }

  /**
   * Current state of the form?
   */
  formState: FormState<TFieldValues>

  /**
   * Idk.
   */
  proxyFormState = {
    /**
     * Whether to update the form's dirty state?
     */
    isDirty: false,
    dirtyFields: false,
    touchedFields: false,
    isValidating: false,
    isValid: false,
    errors: false,
  }

  /**
   * Stores.
   */
  subjects: FormObservables<TFieldValues> = {
    values: observable(),
    array: observable(),
    state: observable(),
  }

  constructor(props: UseFormProps<TFieldValues, TContext> = {}, flushRootRender?: () => void) {
    const resolvedProps = { ...defaultProps, ...props }

    const defaultValues =
      isObject(resolvedProps.defaultValues) || isObject(resolvedProps.values)
        ? structuredClone(resolvedProps.defaultValues || resolvedProps.values) || {}
        : {}

    this.props = resolvedProps

    this.defaultValues = defaultValues as DeepPartial<TFieldValues>

    this.values = (
      resolvedProps.shouldUnregister ? {} : structuredClone(defaultValues)
    ) as TFieldValues

    this.fields = {}

    this.flushRootRender = flushRootRender

    this.shouldDisplayAllAssociatedErrors = resolvedProps.criteriaMode === VALIDATION_MODE.all

    this.formState = {
      submitCount: 0,
      isDirty: false,
      isLoading: typeof resolvedProps.defaultValues === 'function',
      isValidating: false,
      isSubmitted: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
      touchedFields: {},
      dirtyFields: {},
      errors: {},
    }
  }

  getValues(): TFieldValues

  getValues<T extends FieldName<TFieldValues>>(fieldName: T): FlattenObject<TFieldValues>[T]

  getValues<T extends FieldName<TFieldValues>[]>(
    names: readonly [...T],
  ): RecordKeyMapper<FlattenObject<TFieldValues>, T>

  getValues<T extends FieldName<TFieldValues>[]>(
    ...names: readonly [...T]
  ): RecordKeyMapper<FlattenObject<TFieldValues>, T>

  getValues(...fieldNames: any): any {
    const names = fieldNames.length > 1 ? fieldNames : fieldNames[0]
    return safeGetMultiple(this.values, names)
  }

  register<T extends FieldName<TFieldValues>>(
    name: T,
    options?: RegisterOptions<TFieldValues, T>,
  ): UseFormRegisterReturn<T> {
    const field = safeGet<Field | undefined>(this.fields, name)

    deepSet(this.fields, name, {
      ...field,
      _f: {
        ...(field?._f ? field._f : { ref: { name } }),
        name,
        mount: true,
        ...options,
      },
    })

    this.names.mount.add(name)

    if (field) {
      this.updateDisabledField(name, field, options?.disabled)
    } else {
      this.updateValidAndValue(name, true, options?.value)
    }

    const disabledIsDefined = typeof options?.disabled === 'boolean'

    return { disabledIsDefined } as any
  }

  updateDisabledField(name: FieldName<TFieldValues>, field: Field, disabled: boolean = false) {
    const value = disabled ? undefined : safeGet(this.values, name) ?? getFieldValue(field._f)

    deepSet(this.values, name, value)

    const result = this.updateDirtyFields(name, value)

    if (result.shouldUpdate) {
      this.subjects.state.set(result)
    }
  }

  updateDisabledFields(name: FieldName<TFieldValues>, fields: FieldRecord, disabled: boolean) {
    const value = disabled
      ? undefined
      : safeGet(this.values, name) ?? getFieldValue(safeGet(fields, name)._f)

    deepSet(this.values, name, value)

    const result = this.updateDirtyFields(name, value)

    if (result.shouldUpdate) {
      this.subjects.state.set(result)
    }
  }

  updateValidAndValue(name: string, shouldSkipSetValueAs: boolean, value?: unknown, ref?: Ref) {
    const field = safeGet<Field | undefined>(this.fields, name)

    if (field == null) {
      return
    }

    const defaultValue =
      safeGet(this.values, name) ?? value == null ? safeGet(this.defaultValues, name) : value

    if (defaultValue == null || (ref as HTMLInputElement)?.defaultChecked || shouldSkipSetValueAs) {
      deepSet(this.values, name, shouldSkipSetValueAs ? defaultValue : getFieldValue(field._f))
    } else {
      this.setFieldValue(name, defaultValue)
    }

    if (this.state.mount) {
      this.updateValid()
    }
  }

  updateIsValidating(value: boolean) {
    if (this.proxyFormState.isValidating) {
      this.subjects.state.set({ isValidating: value })
    }
  }

  async updateValid(shouldUpdateValid?: boolean) {
    if (!(this.proxyFormState.isValid || shouldUpdateValid)) {
      return
    }

    const isValid = this.props.resolver
      ? isEmptyObject((await this.executeSchema()).errors)
      : await this.executeBuiltInValidation(this.fields, true)

    if (isValid !== this.formState.isValid) {
      this.subjects.state.set({ isValid })
    }
  }

  setFieldValue(name: InternalFieldName, value: any, options: SetValueConfig = {}) {
    const field = safeGet<Field | undefined>(this.fields, name)

    const fieldReference = field?._f

    if (fieldReference == null) {
      this.touch(name, value, options)
      return
    }

    if (!fieldReference.disabled) {
      deepSet(this.values, name, getFieldValueAs(value, fieldReference))
    }

    const fieldValue = isHTMLElement(fieldReference.ref) && value == null ? '' : value

    const updateResult = updateFieldReference(fieldReference, fieldValue)

    if (updateResult === 'custom') {
      this.subjects.values.set({ name, values: { ...this.values } })
    }

    this.touch(name, fieldValue, options)
  }

  touch(name: InternalFieldName, value: unknown, options: SetValueConfig) {
    if (options.shouldTouch) {
      const result = this.updateTouchedAndDirty(name, value, options.shouldDirty)

      if (result) {
        this.subjects.state.set(result)
      }
    }

    if (options.shouldValidate) {
      this.trigger(name as any)
    }
  }

  updateTouchedAndDirty(name: InternalFieldName, fieldValue: unknown, shouldDirty?: boolean) {
    const updateDirtyFieldsResult = shouldDirty
      ? this.updateDirtyFields(name, fieldValue)
      : undefined

    const updateTouchedFieldsResult = this.updateTouchedFields(name)

    const shouldUpdateField =
      updateDirtyFieldsResult?.shouldUpdate || updateTouchedFieldsResult?.shouldUpdate

    return shouldUpdateField
      ? {
          isDirty: updateDirtyFieldsResult?.isDirty,
          dirtyFields: updateDirtyFieldsResult?.dirtyFields,
          touchedFields: updateTouchedFieldsResult.touchedFields,
        }
      : undefined
  }

  updateDirtyFields(name: InternalFieldName, fieldValue: unknown) {
    const updateIsDirtyResult = this.proxyFormState.isDirty ? this.updateIsDirty() : undefined

    const currentFieldIsClean = deepEqual(safeGet(this.defaultValues, name), fieldValue)

    const previousIsDirty = safeGet(this.formState.dirtyFields, name)

    if (currentFieldIsClean) {
      deepUnset(this.formState.dirtyFields, name)
    } else {
      deepSet(this.formState.dirtyFields, name, true)
    }

    const shouldUpdate =
      updateIsDirtyResult?.shouldUpdate ||
      (this.proxyFormState.dirtyFields && previousIsDirty !== !currentFieldIsClean)

    return {
      isDirty: updateIsDirtyResult?.isDirty,
      dirtyFields: this.formState.dirtyFields,
      shouldUpdate,
    }
  }

  updateTouchedFields(name: InternalFieldName) {
    const previousIsTouched = safeGet(this.formState.touchedFields, name)

    if (!previousIsTouched) {
      deepSet(this.formState.touchedFields, name, true)
    }

    const touchedFields = !previousIsTouched ? this.formState.touchedFields : undefined

    const shouldUpdate = !previousIsTouched && this.proxyFormState.touchedFields

    return { touchedFields, shouldUpdate }
  }

  updateIsDirty() {
    const previousIsDirty = this.formState.isDirty

    const isDirty = this.isDirty()

    this.formState.isDirty = isDirty

    const shouldUpdate = previousIsDirty !== isDirty

    return { isDirty, shouldUpdate }
  }

  isDirty(): boolean {
    return !deepEqual(this.getValues(), this.defaultValues)
  }

  trigger: UseFormTrigger<TFieldValues> = async (name, options = {}) => {
    let isValid
    let validationResult
    const fieldNames = (Array.isArray(name) ? name : [name]) as InternalFieldName[]

    this.updateIsValidating(true)

    if (this.props.resolver) {
      const errors = await this.executeSchemaAndUpdateState(name == null ? name : fieldNames)
      isValid = isEmptyObject(errors)
      validationResult = name ? !fieldNames.some((name) => safeGet(errors, name)) : isValid
    } else if (name) {
      validationResult = (
        await Promise.all(
          fieldNames.map(async (fieldName) => {
            const field = safeGet<any>(this.fields, fieldName)
            return await this.executeBuiltInValidation(field?._f ? { [fieldName]: field } : field)
          }),
        )
      ).every(Boolean)
      !(!validationResult && !this.formState.isValid) && this.updateValid()
    } else {
      validationResult = isValid = await this.executeBuiltInValidation(this.fields)
    }

    this.subjects.state.set({
      ...(typeof name !== 'string' ||
      (this.proxyFormState.isValid && isValid !== this.formState.isValid)
        ? {}
        : { name }),
      ...(this.props.resolver || !name ? { isValid } : {}),
      errors: this.formState.errors,
      isValidating: false,
    })

    if (options.shouldFocus && !validationResult) {
      focusFieldBy(
        this.fields,
        (key) => key && safeGet(this.formState.errors, key),
        name ? fieldNames : this.names.mount,
      )
    }

    return validationResult
  }

  async executeBuiltInValidation(
    fields: FieldRecord,
    shouldOnlyCheckValid?: boolean,
    context: ValidationContext = { valid: true },
  ) {
    for (const name in fields) {
      const field = fields[name]

      if (field == null) {
        continue
      }

      const { _f, ...fieldValue } = field

      if (_f) {
        const isFieldArrayRoot = this.names.array.has(_f.name)

        const fieldError = await validateField(
          field,
          this.values,
          this.shouldDisplayAllAssociatedErrors,
          this.props.shouldUseNativeValidation && !shouldOnlyCheckValid,
          isFieldArrayRoot,
        )

        if (fieldError[_f.name]) {
          context.valid = false
          if (shouldOnlyCheckValid) {
            break
          }
        }

        if (shouldOnlyCheckValid) {
          continue
        }

        if (safeGet(fieldError, _f.name)) {
          if (isFieldArrayRoot) {
            updateFieldArrayRootError(this.formState.errors, fieldError, _f.name)
          } else {
            deepSet(this.formState.errors, _f.name, fieldError[_f.name])
          }
        } else {
          deepUnset(this.formState.errors, _f.name)
        }
      }

      if (fieldValue) {
        await this.executeBuiltInValidation(fieldValue, shouldOnlyCheckValid, context)
      }
    }

    return context.valid
  }

  async executeSchema(name?: InternalFieldName[]) {
    return this.props.resolver?.(
      this.values as TFieldValues,
      this.props.context,
      getResolverOptions(
        name || this.names.mount,
        this.fields,
        this.props.criteriaMode,
        this.props.shouldUseNativeValidation,
      ),
    )
  }

  async executeSchemaAndUpdateState(names?: InternalFieldName[]) {
    const { errors } = await this.executeSchema(names)

    if (names) {
      for (const name of names) {
        const error = safeGet(errors, name)

        if (error) {
          deepSet(this.formState.errors, name, error)
        } else {
          deepUnset(this.formState.errors, name)
        }
      }
    } else {
      this.formState.errors = errors
    }

    return errors
  }
}

export type ValidationContext = {
  valid: boolean
}
