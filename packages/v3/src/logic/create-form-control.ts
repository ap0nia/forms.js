import { observable } from '@legendapp/state'

import { VALIDATION_MODE } from '../constants'
import { isCheckBoxInput } from '../lib/html/checkbox'
import { isFileInput } from '../lib/html/file'
import { isMultipleSelectInput } from '../lib/html/select'
import { isEmptyObject } from '../lib/is-empty-object'
import { isHTMLElement } from '../lib/is-html-element'
import type { Field, FieldRefs, InternalFieldName, Ref } from '../types/fields'
import type {
  FormObservables,
  FormState,
  GetIsDirty,
  Names,
  SetValueConfig,
  UseFormGetValues,
  UseFormProps,
  UseFormRegister,
  UseFormTrigger,
} from '../types/form'
import { deepEqual } from '../utils/deep-equal'
import { deepSet } from '../utils/deep-set'
import { deepUnset } from '../utils/deep-unset'
import { isObject } from '../utils/is-object'
import { safeGet } from '../utils/safe-get'
import { safeGetMultiple } from '../utils/safe-get-multiple'

import { focusFieldBy } from './focus-field-by'
import { getFieldValue, getFieldValueAs } from './get-field-values'
import { updateFieldArrayRootError } from './update-field-array-root-error'

const defaultProps = {
  mode: VALIDATION_MODE.onSubmit,
  reValidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true,
} as const

export class FormControl<
  TFieldValues extends Record<string, any> = Record<string, any>,
  TContext = any,
> {
  props: UseFormProps<TFieldValues, TContext>

  defaultValues: any

  values: any

  fields: any

  flushRootRender?: () => void

  shouldDisplayAllAssociatedErrors: boolean

  names: Names = {
    mount: new Set(),
    unMount: new Set(),
    array: new Set(),
    watch: new Set(),
  }

  state = {
    action: false,
    mount: false,
    watch: false,
  }

  formState: FormState<TFieldValues>

  proxyFormState = {
    isDirty: false,
    dirtyFields: false,
    touchedFields: false,
    isValidating: false,
    isValid: false,
    errors: false,
  }

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

    this.props = resolvedProps

    this.defaultValues =
      isObject(resolvedProps.defaultValues) || isObject(resolvedProps.values)
        ? structuredClone(resolvedProps.defaultValues || resolvedProps.values) || {}
        : {}

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

  getValues: UseFormGetValues<TFieldValues> = (fieldNames: any) => {
    return safeGetMultiple(this.getValues, fieldNames)
  }

  register: UseFormRegister<TFieldValues> = (name, options) => {
    const field = safeGet<Field | undefined>(this.fields, name)

    const disabledIsDefined = typeof options?.disabled === 'boolean'

    deepSet(this.fields, name, {
      ...field,
      _f: {
        ...(field?._f ? field._f : { ref: { name } }),
        name,
        mount: true,
        ...options,
      },
    })

    this.names.mount.add('' + name)

    if (field) {
      // _updateDisabledField({
      //   field,
      //   disabled: options.disabled,
      //   name,
      // })
    } else {
      this.updateValidAndValue('' + name, true, options?.value)
    }

    return { disabledIsDefined } as any
  }

  updateValidAndValue(
    name: InternalFieldName,
    shouldSkipSetValueAs: boolean,
    value?: unknown,
    ref?: Ref,
  ) {
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

  updateIsValidating = (value: boolean) => {
    if (this.proxyFormState.isValidating) {
      this.subjects.state.set({ isValidating: value })
    }
  }

  async updateValid(shouldUpdateValid?: boolean) {
    if (!(this.proxyFormState.isValid || shouldUpdateValid)) {
      return
    }

    const isValid = this.props.resolver
      ? isEmptyObject((await _executeSchema()).errors)
      : await executeBuiltInValidation(this.fields, true)

    if (isValid !== this.formState.isValid) {
      this.subjects.state.set({ isValid })
    }
  }

  setFieldValue = (name: InternalFieldName, value: any, options: SetValueConfig = {}) => {
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

    if (options.shouldDirty || options.shouldTouch) {
      this.updateTouchAndDirty(name, fieldValue, options.shouldTouch, options.shouldDirty, true)
    }

    if (options.shouldValidate) {
      trigger(name as Path<TFieldValues>)
    }
  }

  updateTouchAndDirty = (
    name: InternalFieldName,
    fieldValue: unknown,
    isBlurEvent?: boolean,
    shouldDirty?: boolean,
    shouldRender?: boolean,
  ): Partial<Pick<FormState<TFieldValues>, 'dirtyFields' | 'isDirty' | 'touchedFields'>> => {
    let shouldUpdateField = false
    let isPreviousDirty = false
    const output: Partial<FormState<TFieldValues>> & { name: string } = {
      name,
    }

    if (!isBlurEvent || shouldDirty) {
      if (this.proxyFormState.isDirty) {
        isPreviousDirty = this.formState.isDirty
        this.formState.isDirty = output.isDirty = this.getDirty()
        shouldUpdateField = isPreviousDirty !== output.isDirty
      }

      const isCurrentFieldPristine = deepEqual(safeGet(this.defaultValues, name), fieldValue)

      isPreviousDirty = safeGet(this.formState.dirtyFields, name)

      if (isCurrentFieldPristine) {
        deepUnset(this.formState.dirtyFields, name)
      } else {
        deepSet(this.formState.dirtyFields, name, true)
      }

      output.dirtyFields = this.formState.dirtyFields

      shouldUpdateField =
        shouldUpdateField ||
        (this.proxyFormState.dirtyFields && isPreviousDirty !== !isCurrentFieldPristine)
    }

    if (isBlurEvent) {
      const isPreviousFieldTouched = safeGet(this.formState.touchedFields, name)

      if (!isPreviousFieldTouched) {
        deepSet(this.formState.touchedFields, name, isBlurEvent)

        output.touchedFields = this.formState.touchedFields

        shouldUpdateField =
          shouldUpdateField ||
          (this.proxyFormState.touchedFields && isPreviousFieldTouched !== isBlurEvent)
      }
    }

    if (shouldUpdateField && shouldRender) {
      this.subjects.state.set(output)
    }

    return shouldUpdateField ? output : {}
  }

  getDirty: GetIsDirty = (name, data) => {
    return (
      name && data && deepSet(this.values, name, data),
      !deepEqual(this.getValues(), this.defaultValues)
    )
  }

  trigger: UseFormTrigger<TFieldValues> = async (name, options = {}) => {
    let isValid
    let validationResult
    const fieldNames = (Array.isArray(name) ? name : [name]) as InternalFieldName[]

    this.updateIsValidating(true)

    if (this.props.resolver) {
      const errors = await executeSchemaAndUpdateState(name == null ? name : fieldNames)

      isValid = isEmptyObject(errors)
      validationResult = name ? !fieldNames.some((name) => safeGet(errors, name)) : isValid
    } else if (name) {
      validationResult = (
        await Promise.all(
          fieldNames.map(async (fieldName) => {
            const field = safeGet<Field | undefined>(this.fields, fieldName)
            return await executeBuiltInValidation(field?._f ? { [fieldName]: field } : field)
          }),
        )
      ).every(Boolean)
      !(!validationResult && !this.formState.isValid) && this.updateValid()
    } else {
      validationResult = isValid = await executeBuiltInValidation(this.fields)
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

  executeBuiltInValidation = async (
    fields: FieldRefs,
    shouldOnlyCheckValid?: boolean,
    context: {
      valid: boolean
    } = {
      valid: true,
    },
  ) => {
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
        await executeBuiltInValidation(fieldValue, shouldOnlyCheckValid, context)
      }
    }

    return context.valid
  }
}
