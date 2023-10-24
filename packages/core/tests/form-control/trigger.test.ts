import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormContol', () => {
  describe('trigger', () => {
    test('sets isValidating to true', async () => {
      const formControl = new FormControl()

      const fn = vi.fn()

      formControl.state.isValidating.subscribe(fn)

      fn.mockClear()

      formControl.trigger()

      expect(formControl.state.isValidating.value).toBeTruthy()
    })

    describe('merges new errors with existing errors state', () => {
      test('merges native validation errors', async () => {
        const formControl = new FormControl()

        const name = 'test'

        formControl.fields[name] = {
          _f: {
            name,
            ref: { name },
            required: true,
            mount: true,
          },
        }

        await formControl.trigger()

        expect(formControl.state.errors.value).toEqual({
          test: {
            message: '',
            ref: { name },
            type: 'required',
          },
        })
      })

      test('merges resolver errors', async () => {
        const formControl = new FormControl({
          resolver: () => ({ values: {}, errors: { name: { type: 'required' } } }),
        })

        await formControl.trigger()

        expect(formControl.state.errors.value).toEqual({
          name: {
            type: 'required',
          },
        })
      })
    })

    describe('focuses on field when result is invalid and shouldFocus is true', () => {
      test('focuses on first field out of mounted names', async () => {
        const formControl = new FormControl()

        const name = 'test'

        const focus = vi.fn()

        formControl.fields[name] = {
          _f: {
            name,
            ref: {
              name,
              focus,
            },
            required: true,
            mount: true,
          },
        }

        formControl.names.mount.add(name)

        await formControl.trigger(undefined, { shouldFocus: true })

        expect(focus).toHaveBeenCalledOnce()
      })

      test('focuses on first field out of provided names', async () => {
        const formControl = new FormControl()

        const name = 'test'

        const focus = vi.fn()

        formControl.fields[name] = {
          _f: {
            name,
            ref: {
              name,
              focus,
            },
            required: true,
            mount: true,
          },
        }

        await formControl.trigger(name, { shouldFocus: true })

        expect(focus).toHaveBeenCalledOnce()
      })

      test('fails to focus if name is not provided and not in mounted names', async () => {
        const formControl = new FormControl()

        const name = 'test'

        const focus = vi.fn()

        formControl.fields[name] = {
          _f: {
            name,
            ref: {
              name,
              focus,
            },
            required: true,
            mount: true,
          },
        }

        await formControl.trigger(undefined, { shouldFocus: true })

        expect(focus).not.toHaveBeenCalled()
      })
    })
  })
})
