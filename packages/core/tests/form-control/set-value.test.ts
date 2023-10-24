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

    test('updates the ref value if found field reference has no nested fields', () => {
      const ref = document.createElement('input')

      const formControl = new FormControl()

      const name = 'abc'

      formControl.fields[name] = {
        _f: {
          name: ref.name,
          ref,
        },
      }

      const value = 'foobarbaz'

      formControl.setValue(name, value)

      expect(ref.value).toEqual(value)
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

    test('fills in nested field', () => {
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

      const value = 'value'

      formControl.setValue(name0, { [name1]: value })

      expect(ref.value).toEqual(value)

      expect(formControl.state.values.value).toEqual({
        [name0]: {
          [name1]: value,
        },
      })
    })

    test('field array updates dirty states if there are subscribers', () => {
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

      formControl.setValue(name, 'Elysia', { shouldDirty: true })

      expect(formControl.state.isDirty.value).toBeTruthy()

      unsubscribe()
    })

    describe('satisfies invariants', () => {
      test('updates derived store once for existing, non-field array field with nested fields', async () => {
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

        formControl.batchedState.proxy.values
        formControl.batchedState.proxy.isDirty
        formControl.batchedState.proxy.dirtyFields
        formControl.batchedState.proxy.touchedFields

        const fn = vi.fn()

        formControl.batchedState.subscribe(fn)

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
