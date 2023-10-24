import { fireEvent, waitFor } from '@testing-library/dom'
import { describe, test, expect, vi } from 'vitest'

import { trackAll } from '../../src/extensions/track-all'
import { FormControl } from '../../src/form-control'
import type { FieldError } from '../../src/types/errors'
import type { Field } from '../../src/types/fields'
import type { FormControlOptions } from '../../src/types/form'

function createFormControl(options?: FormControlOptions) {
  const formControl = new FormControl(options)

  const name = 'test'

  const ref = document.createElement('input')

  ref.name = name
  ref.addEventListener('change', (event) => formControl.handleChange(event))
  ref.addEventListener('blur', (event) => formControl.handleChange(event))

  const field: Field = {
    _f: {
      name,
      ref,
      mount: true,
    },
  }

  formControl.fields[name] = field

  return { formControl, name, field, ref }
}

describe('FormControl', () => {
  describe('handleChange', () => {
    test('does not do anything if field name is not registered', () => {
      const { formControl } = createFormControl()

      expect(formControl.state.values.value).toEqual({})
    })

    test('sets the new field value in the form control values', () => {
      const { formControl, name, ref } = createFormControl()

      expect(formControl.state.values.value).toEqual({})

      const value = 'abc'

      ref.value = value

      fireEvent.change(ref)

      expect(formControl.state.values.value).toEqual({ [name]: value })
    })

    test('invokes onChange for change events', () => {
      const { field, ref } = createFormControl()

      field._f.onChange = vi.fn()

      fireEvent.change(ref)

      expect(field._f.onChange).toHaveBeenCalledOnce()
    })

    test('invokes onBlur for blur events', () => {
      const { field, ref } = createFormControl()

      field._f.onBlur = vi.fn()

      fireEvent.blur(ref)

      expect(field._f.onBlur).toHaveBeenCalledOnce()
    })

    describe('properly handles native validation', () => {
      test('properly adds errors when the field name is the same as the ref name', async () => {
        const { formControl, name, field, ref } = createFormControl({ mode: 'onChange' })

        field._f.required = true

        fireEvent.change(ref)

        await waitFor(() =>
          expect(formControl.state.errors.value).toEqual({
            [name]: {
              type: 'required',
              message: '',
              ref,
            },
          }),
        )
      })

      test('properly adds errors when the field name is different from the ref name', async () => {
        const { formControl, field, ref } = createFormControl({ mode: 'onChange' })

        const differentName = 'differentName'

        // In the (edge-case) event that this name is different from the ref's name,
        // the form control will prioritize this name.
        // It will re-run the entire validation function and merge all the errors.
        field._f.name = differentName
        field._f.required = true

        fireEvent.change(ref)

        await waitFor(() =>
          expect(formControl.state.errors.value).toEqual({
            [differentName]: {
              type: 'required',
              message: '',
              ref,
            },
          }),
        )
      })

      test('properly adds errors after a blur event', async () => {
        const { formControl, name, field, ref } = createFormControl({ mode: 'onBlur' })

        field._f.required = true

        fireEvent.blur(ref)

        await waitFor(() =>
          expect(formControl.state.errors.value).toEqual({
            [name]: {
              type: 'required',
              message: '',
              ref,
            },
          }),
        )
      })

      test('sets additional errors with trigger if field reference has deps', async () => {
        const { formControl, name, ref, field } = createFormControl({ mode: 'onBlur' })

        const name1 = 'hello'

        // Since name1 is a dependency of name0,
        // the form control will also validate name1 when name0 is validated.
        field._f.deps = [name1]
        field._f.required = true

        const ref1 = { name: name1 }

        formControl.fields[name1] = {
          _f: {
            name: name1,
            ref: ref1,
            mount: true,
            required: true,
          },
        }

        fireEvent.blur(ref)

        await waitFor(() =>
          expect(formControl.state.errors.value).toEqual({
            [name]: {
              message: '',
              type: 'required',
              ref,
            },
            [name1]: {
              message: '',
              type: 'required',
              ref: ref1,
            },
          }),
        )
      })

      test('unsets errors with successful native validation', async () => {
        const { formControl, ref } = createFormControl({ mode: 'onBlur' })

        fireEvent.blur(ref)

        await waitFor(() => expect(formControl.state.errors.value).toEqual({}))
      })
    })

    describe('properly validates with a resolver during handling', () => {
      test('unsets existing error if no resolver errors ', async () => {
        const { formControl, name, field, ref } = createFormControl({
          mode: 'onBlur',
          resolver: (values) => {
            return {
              values,
            }
          },
        })

        field._f.required = true

        // Set an existing error to be removed after the change handler.
        formControl.state.errors.set({ [name]: { type: 'test', message: 'test', ref } })

        ref.addEventListener('blur', (event) => formControl.handleChange(event))

        fireEvent.blur(ref)

        await waitFor(() => expect(formControl.state.errors.value).toEqual({}))
      })

      test('sets a new error if there resolver errors', async () => {
        const { formControl, name, field, ref } = createFormControl({ mode: 'onBlur' })

        const error: FieldError = {
          type: 'value',
          message: '',
          ref,
        }

        formControl.options.resolver = (values) => {
          return {
            values,
            errors: {
              [name]: error,
            },
          }
        }

        field._f.required = true

        fireEvent.blur(ref)

        await waitFor(() => expect(formControl.state.errors.value).toEqual({ [name]: error }))
      })

      test('resolver errors with deps sets multiple errors', async () => {
        const name1 = 'hello'

        const { formControl, name, field, ref } = createFormControl({ mode: 'onBlur' })

        const error: FieldError = {
          type: 'value',
          message: '',
          ref,
        }

        formControl.options.resolver = (values) => {
          return {
            values,
            errors: {
              [name]: error,
              [name1]: error,
            },
          }
        }

        // More errors will be set if this field has dependencies.
        field._f.deps = [name1]
        field._f.required = true

        fireEvent.blur(ref)

        await waitFor(() =>
          expect(formControl.state.errors.value).toEqual({
            [name]: error,
            [name1]: error,
          }),
        )
      })
    })

    describe('satisfies invariants', () => {
      describe('notifies subscribers to batched state at most twice', () => {
        test('notifies subscribers twice if no validation', async () => {
          const { formControl, ref } = createFormControl()

          trackAll(formControl)

          const fn = vi.fn()

          formControl.batchedState.subscribe(fn, undefined, false)

          fireEvent.change(ref)

          await waitFor(() => expect(fn).toHaveBeenCalledTimes(2))
        })

        test('notifies subscribers twice if validation but not tracking isValidating', async () => {
          const { formControl, ref } = createFormControl({
            mode: 'onChange',
            resolver: () => {
              return {
                errors: {},
              }
            },
          })

          trackAll(formControl)

          // Don't track isValidating.
          formControl.batchedState.keys?.delete('isValidating')

          const fn = vi.fn()

          formControl.batchedState.subscribe(fn, undefined, false)

          fireEvent.change(ref)

          await waitFor(() => expect(fn).toHaveBeenCalledTimes(2))
        })

        test('notifies subscribers three times if validation and tracking isValidating', async () => {
          const { formControl, ref } = createFormControl({
            mode: 'onChange',
            resolver: () => {
              return {
                errors: {},
              }
            },
          })

          trackAll(formControl)

          const fn = vi.fn()

          formControl.batchedState.subscribe(fn, undefined, false)

          fireEvent.change(ref)

          await waitFor(() => expect(fn).toHaveBeenCalledTimes(3))
        })
      })
    })
  })
})
