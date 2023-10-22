import { waitFor } from '@testing-library/dom'
import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('setValue', () => {
    test('sets nested value', () => {
      const ref = document.createElement('input')

      const formControl = new FormControl()

      const name0 = 'abc'
      const name1 = 'def'

      formControl.fields[name0] = {
        [name1]: {
          _f: {
            name: ref.name,
            ref,
          },
        },
      }

      const value = 'foobarbaz'

      formControl.setValue(name0, { [name1]: value })

      expect(ref.value).toEqual(value)

      expect(formControl.state.values.value).toEqual({
        [name0]: {
          [name1]: value,
        },
      })
    })

    test('updates dirty states if setting value for field array and there are subscribers to isDirty', () => {
      const ref = document.createElement('input')

      const formControl = new FormControl()

      const subscriber = vi.fn()

      const unsubscribe = formControl.state.dirtyFields.subscribe(subscriber)

      const name = 'abc'

      formControl.names.array.add(name)

      formControl.fields[name] = {
        _f: {
          name: ref.name,
          ref,
        },
      }

      formControl.setValue(name, 'foobarbaz', { shouldDirty: true })

      expect(formControl.state.isDirty.value).toBeTruthy()

      unsubscribe()
    })

    describe('satisfies invariants', () => {
      test('updates stores once for existing, non-field array field with no nested fields', async () => {
        const formControl = new FormControl()

        const name = 'abc'

        formControl.fields[name] = {
          _f: {
            name,
            ref: { name },
          },
        }

        const valuesFn = vi.fn()
        const isDirtyFn = vi.fn()
        const dirtyFieldsFn = vi.fn()
        const touchedFieldsFn = vi.fn()
        const errorsFn = vi.fn()
        const isValidFn = vi.fn()

        formControl.state.values.subscribe(valuesFn)
        formControl.state.isDirty.subscribe(isDirtyFn)
        formControl.state.dirtyFields.subscribe(dirtyFieldsFn)
        formControl.state.touchedFields.subscribe(touchedFieldsFn)
        formControl.state.errors.subscribe(errorsFn)
        formControl.state.isValid.subscribe(isValidFn)

        valuesFn.mockReset()
        isDirtyFn.mockReset()
        dirtyFieldsFn.mockReset()
        touchedFieldsFn.mockReset()
        errorsFn.mockReset()
        isValidFn.mockReset()

        formControl.setValue(name, 'foobarbaz', {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })

        await waitFor(() => expect(valuesFn).toHaveBeenCalledOnce())
        await waitFor(() => expect(isDirtyFn).toHaveBeenCalledOnce())
        await waitFor(() => expect(dirtyFieldsFn).toHaveBeenCalledOnce())
        await waitFor(() => expect(touchedFieldsFn).toHaveBeenCalledOnce())
        await waitFor(() => expect(errorsFn).toHaveBeenCalledOnce())
        await waitFor(() => expect(isValidFn).toHaveBeenCalledOnce())
      })

      test('updates stores once for existing, non-field array field with nested fields', async () => {
        const formControl = new FormControl()

        const name = 'abc'

        formControl.fields[name] = {
          nested: {
            _f: {
              name,
              ref: { name },
            },
          },
        }

        const valuesFn = vi.fn()
        const isDirtyFn = vi.fn()
        const dirtyFieldsFn = vi.fn()
        const touchedFieldsFn = vi.fn()

        formControl.state.values.subscribe(valuesFn)
        formControl.state.isDirty.subscribe(isDirtyFn)
        formControl.state.dirtyFields.subscribe(dirtyFieldsFn)
        formControl.state.touchedFields.subscribe(touchedFieldsFn)

        valuesFn.mockReset()
        isDirtyFn.mockReset()
        dirtyFieldsFn.mockReset()
        touchedFieldsFn.mockReset()

        formControl.setValue(name, ['f', 'o', 'o', 'b', 'a', 'r', 'b', 'a', 'z'], {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })

        await waitFor(() => expect(valuesFn).toHaveBeenCalledOnce())
        await waitFor(() => expect(isDirtyFn).toHaveBeenCalledOnce())
        await waitFor(() => expect(dirtyFieldsFn).toHaveBeenCalledOnce())
        await waitFor(() => expect(touchedFieldsFn).toHaveBeenCalledOnce())
      })

      test.only('updates derived store once for existing, non-field array field with nested fields', async () => {
        const formControl = new FormControl()

        const name = 'abc'

        formControl.fields[name] = {
          nested: {
            _f: {
              name,
              ref: { name },
            },
          },
        }

        formControl.derivedState.proxy.values
        formControl.derivedState.proxy.isDirty
        formControl.derivedState.proxy.dirtyFields
        formControl.derivedState.proxy.touchedFields

        const fn = vi.fn()

        formControl.derivedState.subscribe(fn)

        fn.mockReset()

        formControl.setValue(name, ['f', 'o', 'o', 'b', 'a', 'r', 'b', 'a', 'z'], {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })

        await waitFor(() => expect(fn).toHaveBeenCalledOnce())
      })
    })
  })
})
