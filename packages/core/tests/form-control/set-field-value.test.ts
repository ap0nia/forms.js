import { waitFor, screen } from '@testing-library/dom'
import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('setFieldValue', () => {
    test('does not update values for existing, disabled field', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.fields[name] = {
        _f: {
          name,
          ref: { name },
          disabled: true,
        },
      }

      formControl.setFieldValue(name, 'Hello', { shouldValidate: true })

      expect(formControl.state.values.value).toEqual({})
    })

    test('updates values for for existing, enabled field', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.fields[name] = {
        _f: {
          name,
          ref: { name },
        },
      }

      formControl.setFieldValue(name, 'Hello')

      expect(formControl.state.values.value).toEqual({ [name]: 'Hello' })
    })

    test('does not update values for new field', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.setFieldValue(name, null)

      expect(formControl.state.values.value).toEqual({})
    })

    test('updates touched and dirty for new field name', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.setFieldValue(name, null, { shouldDirty: true, shouldTouch: true })

      expect(formControl.state.touchedFields.value).toEqual({
        [name]: true,
      })

      expect(formControl.state.dirtyFields.value).toEqual({
        [name]: true,
      })
    })

    test('sets field value to empty string when setting null value on input element', () => {
      const formControl = new FormControl()

      const name = 'name'

      const ref = document.createElement('input')

      formControl.fields[name] = {
        _f: {
          name,
          ref,
        },
      }

      formControl.setFieldValue(name, null)

      expect(ref.value).toEqual('')
    })

    test('changes field value visibly in the DOM', async () => {
      const formControl = new FormControl()

      const name = 'name'

      const ref = document.createElement('input')

      document.body.appendChild(ref)

      formControl.fields[name] = {
        _f: {
          name,
          ref,
        },
      }

      expect(ref.value).toEqual('')

      const value = 'foobarbaz'

      formControl.setFieldValue(name, value)

      await waitFor(() => expect(screen.getByDisplayValue(value)).toBeTruthy())
    })

    describe('satisfies invariants', () => {
      test('only updates stores once', async () => {
        const formControl = new FormControl()

        const name = 'name'

        const ref = document.createElement('input')

        formControl.fields[name] = {
          _f: {
            name,
            ref,
            required: true,
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

        formControl.setFieldValue(name, '', {
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

      test('updates derived store once if not listening to isValidating', async () => {
        vi.useFakeTimers()

        const formControl = new FormControl()

        const name = 'name'

        const ref = document.createElement('input')

        formControl.fields[name] = {
          _f: {
            name,
            ref,
            required: true,
          },
        }

        const fn = vi.fn()

        formControl.derivedState.subscribe(fn)

        fn.mockReset()

        formControl.derivedState.proxy.values
        formControl.derivedState.proxy.isDirty
        formControl.derivedState.proxy.dirtyFields
        formControl.derivedState.proxy.touchedFields
        formControl.derivedState.proxy.errors
        formControl.derivedState.proxy.isValid

        formControl.setFieldValue(name, '', {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })

        await vi.runAllTimersAsync()

        expect(fn).toHaveBeenCalledOnce()

        vi.useRealTimers()
      })

      test('updates derived store twice if listening to isValidating', async () => {
        vi.useFakeTimers()

        const formControl = new FormControl()

        const name = 'name'

        const ref = document.createElement('input')

        formControl.fields[name] = {
          _f: {
            name,
            ref,
            required: true,
          },
        }

        const fn = vi.fn()

        formControl.derivedState.subscribe(fn)

        fn.mockReset()

        formControl.derivedState.proxy.isValidating
        formControl.derivedState.proxy.values
        formControl.derivedState.proxy.isDirty
        formControl.derivedState.proxy.dirtyFields
        formControl.derivedState.proxy.touchedFields
        formControl.derivedState.proxy.errors
        formControl.derivedState.proxy.isValid

        formControl.setFieldValue(name, '', {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })

        await vi.runAllTimersAsync()

        expect(fn).toHaveBeenCalledTimes(2)

        vi.useRealTimers()
      })
    })
  })
})
