import { describe, test, expect, vi } from 'vitest'

import { trackAll } from '../../src/extensions/track-all'
import { FormControl } from '../../src/form-control'
import type { FieldErrorRecord } from '../../src/types/errors'
import type { Resolver, ResolverResult } from '../../src/types/resolver'

describe('FormControl', () => {
  describe('handleSubmit', () => {
    test('calls onValid callback for valid form submission', async () => {
      const values = {
        a: {
          b: {
            c: 'd',
          },
        },
      }

      const valueClone = structuredClone(values)

      const formControl = new FormControl({
        values,
        resolver: (values) => ({ values }),
      })

      const onValid = vi.fn()

      const event = new Event('')

      await formControl.handleSubmit(onValid)(event)

      expect(onValid).toHaveBeenCalledOnce()

      expect(onValid).toHaveBeenCalledWith(valueClone, event)
    })

    test('calls onInvalid callback for invalid form based on resolver', async () => {
      const resolverResult: ResolverResult = {
        values: {},
        errors: { a: { type: 'required' } },
      }

      const resolver: Resolver = () => resolverResult

      const formControl = new FormControl({ resolver })

      const onInvalid = vi.fn()

      const event = new Event('')

      await formControl.handleSubmit(undefined, onInvalid)(event)

      expect(onInvalid).toHaveBeenCalledOnce()

      expect(onInvalid).toHaveBeenCalledWith(resolverResult.errors, event)
    })

    test('calls onInvalid callback for invalid form based on native validation ', async () => {
      const formControl = new FormControl()

      const name = 'a'

      formControl.fields[name] = {
        _f: {
          name,
          mount: true,
          ref: { name },
          required: true,
        },
      }

      const onInvalid = vi.fn()

      const event = new Event('')

      await formControl.handleSubmit(undefined, onInvalid)(event)

      expect(onInvalid).toHaveBeenCalledOnce()

      const errors: FieldErrorRecord = {
        [name]: {
          message: '',
          type: 'required',
          ref: {
            name,
          },
        },
      }

      expect(onInvalid).toHaveBeenCalledWith(errors, event)
    })

    test('calls event prevent default', async () => {
      const event = new Event('')

      event.preventDefault = vi.fn()

      const formControl = new FormControl()

      await formControl.handleSubmit()(event)

      expect(event.preventDefault).toHaveBeenCalledOnce()
    })

    /**
     * This should never be possible. If there are no errors, then it will be valid.
     * Due to the limitations of TypeScript, we'll force the validate method to do this for
     * the coverage.
     */
    test('force validation to return not valid and null errors', async () => {
      const formControl = new FormControl()

      const event = new Event('')

      formControl.validate = async () => ({
        isValid: false,
        resolverResult: {
          values: {},
        },
      })

      const onInvalid = vi.fn()

      await formControl.handleSubmit(undefined, onInvalid)(event)

      expect(onInvalid).toHaveBeenCalledOnce()

      // The errors object defaults to an empty object if the validate method doesn't return errors
      // in a validationResult or resolverResult
      expect(onInvalid).toHaveBeenCalledWith({}, event)
    })

    describe('satisfies invariants', () => {
      describe('notifies subscribers to batched state at most twice', () => {
        test('notifies subscribers once', async () => {
          const formControl = new FormControl()

          const fn = vi.fn()

          trackAll(formControl)

          formControl.batchedState.subscribe(fn, undefined, false)

          const event = new Event('')

          await formControl.handleSubmit()(event)

          expect(fn).toHaveBeenCalledOnce()
        })
      })
    })
  })
})
