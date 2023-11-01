import { describe, test, expect, vi } from 'vitest'

import { trackAll } from '../../src/extensions/track-all'
import { FormControl } from '../../src/form-control'
import type { RegisterOptions } from '../../src/types/register'

describe('FormContol', () => {
  describe('registerField', () => {
    test('correctly creates new field', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.registerField(name)

      expect(formControl.fields[name]).toEqual({
        _f: {
          name,
          ref: { name },
          mount: true,
        },
      })
    })

    test('includes all provided options with the new field', () => {
      const formControl = new FormControl()

      const name = 'name'

      const options: RegisterOptions = {
        min: 0,
        max: 10,
        maxLength: 10,
        minLength: 0,
      }

      formControl.registerField(name, options)

      expect(formControl.fields[name]).toEqual({
        _f: {
          name,
          ref: { name },
          mount: true,
          ...options,
        },
      })
    })

    test('includes properties from existing field and overrides name and mount', () => {
      const formControl = new FormControl()

      const name = 'name'

      const options: RegisterOptions = {
        min: 0,
        max: 10,
        maxLength: 10,
        minLength: 0,
      }

      formControl.fields[name] = {
        _f: {
          name: 'fake name',
          ref: { name: 'fake name' },
          mount: false,
          ...options,
        },
      }

      formControl.registerField(name)

      expect(formControl.fields[name]).toEqual({
        _f: {
          name,
          ref: { name: 'fake name' },
          mount: true,
          ...options,
        },
      })
    })

    test('updates form control values to undefined if existing field is disabled', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.stores.values.value[name] = 'Hello, World!'

      formControl.fields[name] = {
        _f: {
          name,
          ref: { name },
          mount: false,
        },
      }

      formControl.registerField(name, { disabled: true })

      expect(formControl.stores.values.value[name]).toBeUndefined()
    })

    test('adds registered name to set of mounted names', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.registerField(name)

      expect(formControl.names.mount).toContain(name)
    })

    describe('updates values properly after registering a field', () => {
      test('does not change values if value exists for the field name', () => {
        const formControl = new FormControl()

        const name = 'name'

        const value = 'Hello, World!'

        formControl.stores.values.set({ [name]: value })

        const originalValues = structuredClone(formControl.stores.values.value)

        formControl.registerField(name)

        expect(formControl.stores.values.value).toEqual(originalValues)
      })

      test('updates values with provided value if value does not exist for the field name', () => {
        const formControl = new FormControl()

        const name = 'name'

        const value = 'Hello, World!'

        formControl.registerField(name, { value })

        expect(formControl.stores.values.value[name]).toEqual(value)
      })

      test('updates values with default value if the value does not exist and no value is provided', () => {
        const value = 'Hello, World!'

        const formControl = new FormControl({
          defaultValues: {
            name: value,
          },
        })

        const name = 'name'

        formControl.registerField(name)

        expect(formControl.stores.values.value[name]).toEqual(value)
      })

      test('does not change values if value does not exist, no value is provided, and default value does not exist', () => {
        const values = {
          name: 'Hello, World!',
          foo: 'bar',
          baz: 'qux',
        }

        const formControl = new FormControl()

        const name = 'not-in-values'

        const originalValues = structuredClone(values)

        formControl.stores.values.set(values)

        formControl.registerField(name)

        expect(formControl.stores.values.value).toEqual(originalValues)
      })
    })

    describe('satisfies invariants', () => {
      test('does not update state', () => {
        const formControl = new FormControl()

        const fn = vi.fn()

        trackAll(formControl)

        formControl.state.subscribe(fn)

        fn.mockReset()

        formControl.registerField('name')

        expect(fn).not.toHaveBeenCalled()
      })
    })
  })
})
