import { observable } from '@legendapp/state'

import { VALIDATION_MODE, type CriteriaMode } from '../constants'
import { isCheckBoxInput } from '../lib/html/checkbox'
import { isFileInput } from '../lib/html/file'
import { isMultipleSelectInput } from '../lib/html/select'
import { isEmptyObject } from '../lib/is-empty-object'
import { isHTMLElement } from '../lib/is-html-element'
import type { DeepPartial } from '../type-utils/deep-partial'
import type { FlattenObject } from '../type-utils/flatten-object'
import type {
  Field,
  FieldName,
  FieldRefs,
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
import { updateFieldArrayRootError } from './update-field-array-root-error'
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
    const resolvedProps = {
      ...defaultProps,
      ...props,
    }

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

  /**
   * Get the entire form values when no argument is supplied to this function.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
   *
   * @returns form values
   *
   * @example
   * ```tsx
   * <button onClick={() => getValues()}>getValues</button>
   *
   * <input {...register("name", {
   *   validate: (value, formValues) => formValues.otherField === value;
   * })} />
   * ```
   */
  getValues(): TFieldValues

  /**
   * Get a single field value.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
   *
   * @param name - the path name to the form field value.
   *
   * @returns the single field value
   *
   * @example
   * ```tsx
   * <button onClick={() => getValues("name")}>getValues</button>
   *
   * <input {...register("name", {
   *   validate: () => getValues('otherField') === "test";
   * })} />
   * ```
   */
  getValues<T extends FieldName<TFieldValues>>(fieldName: T): FlattenObject<TFieldValues>[T]

  /**
   * Get an array of field values.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
   *
   * @param names - an array of field names
   *
   * @returns An array of field values
   *
   * @example
   * ```tsx
   * <button onClick={() => getValues(["name", "name1"])}>getValues</button>
   *
   * <input {...register("name", {
   *   validate: () => getValues(["fieldA", "fieldB"]).includes("test");
   * })} />
   * ```
   */
  getValues<T extends FieldName<TFieldValues>[]>(
    names: readonly [...T],
  ): RecordKeyMapper<FlattenObject<TFieldValues>, T>

  /**
   * Implementation.
   */
  getValues(fieldNames?: any): any {
    return safeGetMultiple(this.getValues, fieldNames)
  }

  /**
   * Register a name to the internal form state.
   *
   * @param name The dot-concatenated path name of the form field.
   * @param options Options to configure field registration.
   *
   * @returns props.
   */
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

  /**
   * Update the value of a field based on its disabled status.
   */
  updateDisabledField(name: FieldName<TFieldValues>, field: Field, disabled: boolean = false) {
    const value = disabled ? undefined : safeGet(this.values, name) ?? getFieldValue(field._f)

    deepSet(this.values, name, value)

    const result = this.updateDirtyFields(name, value)

    if (result.shouldUpdate) {
      this.subjects.state.set(result)
    }
  }

  /**
   * Update the value of fields based on their disabled status.
   */
  updateDisabledFields(name: FieldName<TFieldValues>, fields: FieldRefs, disabled: boolean) {
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
    const field: Field = safeGet(this.fields, name)

    let fieldValue: unknown = value

    if (field) {
      const fieldReference = field._f

      if (fieldReference) {
        !fieldReference.disabled &&
          deepSet(this.values, name, getFieldValueAs(value, fieldReference))

        fieldValue = isHTMLElement(fieldReference.ref) && value == null ? '' : value

        if (isMultipleSelectInput(fieldReference.ref)) {
          Array.from(fieldReference.ref.options).forEach(
            (optionRef) =>
              (optionRef.selected = (fieldValue as InternalFieldName[]).includes(optionRef.value)),
          )
        } else if (fieldReference.refs) {
          if (isCheckBoxInput(fieldReference.ref)) {
            if (fieldReference.refs.length > 1) {
              fieldReference.refs.forEach(
                (checkboxRef) =>
                  (!checkboxRef.defaultChecked || !checkboxRef.disabled) &&
                  (checkboxRef.checked = Array.isArray(fieldValue)
                    ? !!(fieldValue as []).find((data: string) => data === checkboxRef.value)
                    : fieldValue === checkboxRef.value),
              )
            } else {
              fieldReference.refs[0] && (fieldReference.refs[0].checked = !!fieldValue)
            }
          } else {
            fieldReference.refs.forEach(
              (radioRef: HTMLInputElement) => (radioRef.checked = radioRef.value === fieldValue),
            )
          }
        } else if (isFileInput(fieldReference.ref)) {
          fieldReference.ref.value = ''
        } else {
          fieldReference.ref.value = fieldValue

          if (!fieldReference.ref.type) {
            this.subjects.values.set({ name, values: { ...this.values } })
          }
        }
      }
    }

    if (options.shouldTouch) {
      const result = this.updateTouchedAndDirty(name, fieldValue, options.shouldDirty)

      if (result) {
        this.subjects.state.set(result)
      }
    }

    if (options.shouldValidate) {
      this.trigger(name as any)
    }
  }

  /**
   * i.e. you can update the touched and dirty status after an onBlur event.
   */
  updateTouchedAndDirty(
    name: InternalFieldName,
    fieldValue: unknown,
    shouldDirty?: boolean,
  ): UpdateTouchAndDirtyResult<TFieldValues> | undefined {
    /**
     * Only update dirty fields and get the result if requested.
     */
    const updateDirtyFieldsResult = shouldDirty ? this.updateDirtyFields(name, fieldValue) : null

    /**
     * Always update touched fields and get the result.
     */
    const updateTouchedFieldsResult = this.updateTouchedFields(name)

    /**
     * If either of the results indicate that the field should be updated, then return a defined result.
     */
    const shouldUpdateField =
      updateDirtyFieldsResult?.shouldUpdate || updateTouchedFieldsResult?.shouldUpdate

    const result = {
      isDirty: updateDirtyFieldsResult?.isDirty,
      touchedFields: updateTouchedFieldsResult.touchedFields,
      dirtyFields: updateDirtyFieldsResult?.dirtyFields,
    } as UpdateTouchAndDirtyResult<TFieldValues>

    return shouldUpdateField ? result : undefined
  }

  /**
   * Update {@link formState.isDirty} based on the current values of the ***field***.
   */
  updateDirtyFields(
    name: InternalFieldName,
    fieldValue: unknown,
  ): UpdateDirtyFieldsResult<TFieldValues> {
    /**
     * Update and get the newest dirty state of the form if {@link proxyFormState.isDirty} indicates to do so.
     */
    const updateIsDirtyResult = this.proxyFormState.isDirty ? this.updateIsDirty() : undefined

    /**
     * Whether the current field should currently be clean based on its current and default value.
     */
    const isClean = deepEqual(safeGet(this.defaultValues, name), fieldValue)

    /**
     * Whether the current field is currently dirty based on {@link formState}.
     */
    const previousIsDirty = safeGet(this.formState.dirtyFields, name)

    // If the field is currently clean, then unset the dirty flag. Otherwise, set the dirty flag.
    if (isClean) {
      deepUnset(this.formState.dirtyFields, name)
    } else {
      deepSet(this.formState.dirtyFields, name, true)
    }

    /**
     * Whether the dirty state of this field changed.
     *
     * TODO: not sure why {@link proxyFormState.dirtyFields} has to be true as well.
     */
    const shouldUpdate =
      updateIsDirtyResult?.shouldUpdate ||
      (this.proxyFormState.dirtyFields && previousIsDirty !== !isClean)

    return {
      isDirty: updateIsDirtyResult?.isDirty,
      dirtyFields: this.formState.dirtyFields,
      shouldUpdate,
    }
  }

  /**
   * Idk.
   */
  updateTouchedFields(name: InternalFieldName): UpdateTouchedFieldsResult {
    /**
     * Whether this field was touched.
     */
    const previousIsTouched = safeGet(this.formState.touchedFields, name)

    /**
     * It should be touched now.
     */
    if (!previousIsTouched) {
      deepSet(this.formState.touchedFields, name, true)
    }

    /**
     * Only provided if the field was not previously touched.
     */
    const touchedFields = !previousIsTouched ? this.formState.touchedFields : undefined

    /**
     * Whether the touched state of this field changed.
     */
    const shouldUpdate =
      !previousIsTouched && this.proxyFormState.touchedFields && previousIsTouched

    return { touchedFields, shouldUpdate }
  }

  /**
   * Update {@link formState.isDirty} based on the current values of the ***form***.
   */
  updateIsDirty(): UpdateIsDirtyResult<TFieldValues> {
    const previousIsDirty = this.formState.isDirty

    const isDirty = this.isDirty()

    this.formState.isDirty = isDirty

    const shouldUpdate = previousIsDirty !== isDirty

    return { isDirty, shouldUpdate }
  }

  /**
   * Determine if the form is dirty by comparing the current values of the form with the default values.
   */
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
    fields: FieldRefs,
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

  executeSchema = async (name?: InternalFieldName[]) => {
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

  executeSchemaAndUpdateState = async (names?: InternalFieldName[]) => {
    const { errors } = await this.executeSchema(names)

    if (names) {
      for (const name of names) {
        const error = safeGet(errors, name)
        error ? deepSet(this.formState.errors, name, error) : deepUnset(this.formState.errors, name)
      }
    } else {
      this.formState.errors = errors
    }

    return errors
  }
}

export function getResolverOptions<T extends FieldValues>(
  fieldsNames: Set<InternalFieldName> | InternalFieldName[],
  _fields: FieldRefs,
  criteriaMode?: CriteriaMode,
  shouldUseNativeValidation?: boolean | undefined,
) {
  const fields: Record<InternalFieldName, Field['_f']> = {}

  for (const name of fieldsNames) {
    const field = safeGet<Field | undefined>(_fields, name)

    field && deepSet(fields, name, field._f)
  }

  return {
    criteriaMode,
    names: [...fieldsNames] as FieldName<T>[],
    fields,
    shouldUseNativeValidation,
  }
}

export type ValidationContext = {
  valid: boolean
}

export type UpdateIsDirtyResult<T extends FieldValues = FieldValues> = Partial<
  Pick<FormState<T>, 'isDirty'>
> & {
  /**
   * Whether the dirty state of the ***form*** changed and should be updated, i.e. re-rendered.
   */
  shouldUpdate: boolean
}

export type UpdateDirtyFieldsResult<T extends FieldValues = FieldValues> = Partial<
  Pick<FormState<T>, 'dirtyFields' | 'isDirty'>
> & {
  /**
   * Whether the dirty state of the ***field*** changed and should be updated, i.e. re-rendered.
   */
  shouldUpdate: boolean
}

export type UpdateTouchedFieldsResult<T extends FieldValues = FieldValues> = Partial<
  Pick<FormState<T>, 'touchedFields'>
> & {
  /**
   * Whether the dirty state of the ***field*** changed and should be updated, i.e. re-rendered.
   */
  shouldUpdate: boolean
}

export type UpdateTouchAndDirtyResult<T extends FieldValues = FieldValues> = Partial<
  Pick<FormState<T>, 'dirtyFields' | 'isDirty' | 'touchedFields'>
>
