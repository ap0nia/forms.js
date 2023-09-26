import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { InternalFieldErrors } from '../../src/types/errors'
import type { Resolver, ResolverResult } from '../../src/types/resolver'

describe('FormControl', () => {
  describe('handleSubmit', () => {
    test('valid form calls onValid callback', async () => {
      const values = {
        a: {
          b: {
            c: 'd',
          },
        },
      }

      const valueClone = structuredClone(values)

      const formControl = new FormControl({ values })

      const onValid = vi.fn()

      const event = undefined

      const handleSubmit = formControl.handleSubmit(onValid)

      await handleSubmit(event)

      expect(onValid).toHaveBeenCalledOnce()

      expect(onValid).toHaveBeenCalledWith(valueClone, event)
    })

    test('invalid form calls onInvalid callback', async () => {
      const resolverResult: ResolverResult = { values: {}, errors: { a: { type: 'required' } } }

      const resolver: Resolver = () => resolverResult

      const formControl = new FormControl({ resolver })

      const onInvalid = vi.fn()

      const event = undefined

      const handleSubmit = formControl.handleSubmit(undefined, onInvalid)

      await handleSubmit(event)

      expect(onInvalid).toHaveBeenCalledOnce()

      expect(onInvalid).toHaveBeenCalledWith(resolverResult.errors, event)
    })

    test('invalid native validation calls onInvalid callback', async () => {
      const formControl = new FormControl()

      const name = 'a'

      formControl.register(name, { required: true })

      const onInvalid = vi.fn()

      const event = undefined

      const handleSubmit = formControl.handleSubmit(undefined, onInvalid)

      await handleSubmit(event)

      expect(onInvalid).toHaveBeenCalledOnce()

      const errors: InternalFieldErrors = {
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

    test('event prevent default and persist', async () => {
      const preventDefault = vi.fn()
      const persist = vi.fn()

      const event = { preventDefault, persist }

      const formControl = new FormControl()

      const handleSubmit = formControl.handleSubmit()

      await handleSubmit(event as any)

      expect(preventDefault).toHaveBeenCalledOnce()
      expect(persist).toHaveBeenCalledOnce()
    })

    /**
     * This should never be possible. If there are no errors, then it will be valid.
     * Due to the limitations of TypeScript, we'll force the validate method to do this for
     * the coverage.
     */
    test('force validation to return not valid and null errors', async () => {
      const formControl = new FormControl()

      const event = undefined

      formControl.validate = async () => ({
        isValid: false,
        resolverResult: {
          values: {},
        },
      })

      const onInvalid = vi.fn()

      const handleSubmit = formControl.handleSubmit(undefined, onInvalid)

      await handleSubmit(event)

      expect(onInvalid).toHaveBeenCalledOnce()

      // The errors object defaults to an empty object if
      // the validate method doesn't return errors in a validationResult or resolverResult
      expect(onInvalid).toHaveBeenCalledWith({}, event)
    })
  })
})
