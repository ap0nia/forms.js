import { fireEvent, waitFor } from '@testing-library/dom'
import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { FieldError } from '../../src/types/errors'
import type { Field } from '../../src/types/fields'

describe('FormControl', () => {
  describe('handleChange', () => {
    test('does not do anything if field name is not registered', () => {
      const input = document.createElement('input')

      const formControl = new FormControl()

      input.addEventListener('change', (event) => formControl.handleChange(event))

      fireEvent.change(input, { target: { value: '' } })

      expect(formControl.state.values.value).toEqual({})
    })

    test('sets the new field value in the form control values', () => {
      const formControl = new FormControl()

      const name = 'test'

      const value = 'Hello, World'

      const ref = document.createElement('input')
      ref.name = name

      formControl.fields[name] = {
        _f: {
          name,
          ref,
        },
      }

      expect(formControl.state.values.value).toEqual({})

      ref.addEventListener('change', (event) => formControl.handleChange(event))

      ref.value = value

      fireEvent.change(ref)

      expect(formControl.state.values.value).toEqual({ [name]: value })
    })

    test('invokes onChange for change events', () => {
      const formControl = new FormControl()

      const name = 'test'

      const ref = document.createElement('input')
      ref.name = name

      const field = {
        _f: {
          name,
          ref,
          onChange: vi.fn(),
        },
      } satisfies Field

      formControl.fields[name] = field

      ref.addEventListener('change', (event) => formControl.handleChange(event))

      fireEvent.change(ref)

      expect(field._f.onChange).toHaveBeenCalledOnce()
    })

    test('invokes onBlur for blur events', () => {
      const formControl = new FormControl()

      const name = 'test'

      const ref = document.createElement('input')
      ref.name = name

      const field = {
        _f: {
          name,
          ref,
          onBlur: vi.fn(),
        },
      } satisfies Field

      formControl.fields[name] = field

      ref.addEventListener('blur', (event) => formControl.handleChange(event))

      fireEvent.blur(ref)

      expect(field._f.onBlur).toHaveBeenCalledOnce()
    })

    describe('native validation', () => {
      test('field reference name is the same as the ref name', () => {
        const formControl = new FormControl({ mode: 'onChange' })

        const subscriber = vi.fn()

        formControl.state.isValid.subscribe(subscriber)

        const name = 'test'

        const ref = document.createElement('input')
        ref.name = name

        formControl.fields[name] = {
          _f: {
            name,
            ref,
            mount: true,
            required: true,
          },
        }

        ref.addEventListener('change', (event) => formControl.handleChange(event))

        fireEvent.change(ref)

        waitFor(() => expect(formControl.state.errors.value).toBe({ [name]: { required: true } }))
      })

      test('field reference name is different from the ref name', () => {
        const formControl = new FormControl({ mode: 'onChange' })

        const subscriber = vi.fn()

        formControl.state.isValid.subscribe(subscriber)

        const name = 'test'
        const differentName = 'differentName'

        const ref = document.createElement('input')
        ref.name = name

        formControl.fields[name] = {
          _f: {
            // In the (edge-case) event that this name is different from the ref's name,
            // the form control will prioritize this name.
            // It will re-run the entire validation function and merge all the errors.
            name: differentName,
            ref,
            mount: true,
            required: true,
          },
        }

        ref.addEventListener('change', (event) => formControl.handleChange(event))

        fireEvent.change(ref)

        waitFor(() =>
          expect(formControl.state.errors.value).toBe({ [differentName]: { required: true } }),
        )
      })

      test('blur event', async () => {
        const formControl = new FormControl({ mode: 'onBlur' })

        const name = 'test'

        const ref = document.createElement('input')
        ref.name = name

        formControl.fields[name] = {
          _f: {
            name,
            ref,
            mount: true,
            required: true,
          },
        }

        ref.addEventListener('blur', (event) => formControl.handleChange(event))

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
        const formControl = new FormControl({ mode: 'onBlur' })

        const name0 = 'test'
        const name1 = 'hello'

        const ref = document.createElement('input')
        ref.name = name0

        formControl.fields[name0] = {
          _f: {
            name: name0,
            ref,
            mount: true,
            required: true,

            // Since name1 is a dependency of name0,
            // the form control will also validate name1 when name0 is validated.
            deps: [name1],
          },
        }

        formControl.fields[name1] = {
          _f: {
            name: name1,
            ref: { name: name1 },
            mount: true,
            required: true,
          },
        }

        ref.addEventListener('blur', (event) => formControl.handleChange(event))

        fireEvent.blur(ref)

        await waitFor(() =>
          expect(formControl.state.errors.value).toEqual({
            [name0]: {
              message: '',
              type: 'required',
              ref,
            },
            [name1]: {
              message: '',
              type: 'required',
              ref: { name: name1 },
            },
          }),
        )
      })

      test('unsets errors with successful native validation', async () => {
        const formControl = new FormControl({ mode: 'onBlur' })

        const name0 = 'test'

        const ref = document.createElement('input')
        ref.name = name0

        formControl.fields[name0] = {
          _f: {
            name: name0,
            ref,
            mount: true,
          },
        }

        formControl.state.errors.set({
          [name0]: {
            message: '',
            type: 'required',
            ref,
          },
        })

        ref.addEventListener('blur', (event) => formControl.handleChange(event))

        fireEvent.blur(ref)

        await waitFor(() => expect(formControl.state.errors.value).toEqual({}))
      })
    })

    describe('resolver', () => {
      test('no resolver errors unsets existing error', async () => {
        const formControl = new FormControl({
          mode: 'onBlur',
          resolver: (values) => {
            return {
              values,
            }
          },
        })

        const name = 'test'

        const ref = document.createElement('input')
        ref.name = name

        formControl.fields[name] = {
          _f: {
            name,
            ref,
            mount: true,
            required: true,
          },
        }

        // Set an existing error to be removed after the change handler.
        formControl.state.errors.set({ [name]: { type: 'test', message: 'test', ref } })

        ref.addEventListener('blur', (event) => formControl.handleChange(event))

        fireEvent.blur(ref)

        await waitFor(() => expect(formControl.state.errors.value).toEqual({}))
      })

      test('resolver errors sets new error', async () => {
        const name = 'test'

        const ref = document.createElement('input')
        ref.name = name

        const error: FieldError = {
          type: 'value',
          message: '',
          ref,
        }

        const formControl = new FormControl({
          mode: 'onBlur',
          resolver: (values) => {
            return {
              values,
              errors: {
                [name]: error,
              },
            }
          },
        })

        formControl.fields[name] = {
          _f: {
            name,
            ref,
            mount: true,
            required: true,
          },
        }

        // Set an existing error to be removed after the change handler.
        formControl.state.errors.set({ [name]: { type: 'test', message: 'test', ref } })

        ref.addEventListener('blur', (event) => formControl.handleChange(event))

        fireEvent.blur(ref)

        await waitFor(() => expect(formControl.state.errors.value).toEqual({ [name]: error }))
      })

      test('resolver errors with deps sets multiple errors', async () => {
        const name0 = 'test'
        const name1 = 'hello'

        const ref = document.createElement('input')
        ref.name = name0

        const error: FieldError = {
          type: 'value',
          message: '',
          ref,
        }

        const formControl = new FormControl({
          mode: 'onBlur',
          resolver: (values) => {
            return {
              values,
              errors: {
                [name0]: error,
                [name1]: error,
              },
            }
          },
        })

        formControl.fields[name0] = {
          _f: {
            name: name0,
            ref,
            mount: true,
            required: true,

            // More errors will be set if this field has dependencies.
            deps: [name1],
          },
        }

        // Set an existing error to be removed after the change handler.
        formControl.state.errors.set({ [name0]: { type: 'test', message: 'test', ref } })

        ref.addEventListener('blur', (event) => formControl.handleChange(event))

        fireEvent.blur(ref)

        await waitFor(() =>
          expect(formControl.state.errors.value).toEqual({
            [name0]: error,
            [name1]: error,
          }),
        )
      })
    })
  })
})
