import { VALIDATION_EVENTS } from '@forms.js/core'
import { act, renderHook } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'

import { useForm } from '../../src/use-form'

describe('useForm', () => {
  describe('trigger', () => {
    test('calls the resolver with the field being validated when `trigger` is called', async () => {
      const resolver = vi.fn((values: any) => ({ values, errors: {} }))
      const defaultValues = { test: { sub: 'test' }, test1: 'test1' }

      const { result } = renderHook(() =>
        useForm<typeof defaultValues>({
          mode: VALIDATION_EVENTS.onChange,
          resolver,
          defaultValues,
        }),
      )

      expect(resolver).not.toHaveBeenCalled()

      result.current.register('test.sub')
      result.current.register('test1')

      await result.current.trigger('test.sub')

      const fields = {
        test: {
          sub: {
            mount: true,
            name: 'test.sub',
            ref: { name: 'test.sub' },
          },
        },
        test1: {
          mount: true,
          name: 'test1',
          ref: {
            name: 'test1',
          },
        },
      }

      expect(resolver).toHaveBeenCalledWith(defaultValues, undefined, {
        criteriaMode: undefined,
        fields: { test: fields.test },
        names: ['test.sub'],
      })

      await act(async () => {
        result.current.trigger()
      })

      expect(resolver).toHaveBeenNthCalledWith(2, defaultValues, undefined, {
        criteriaMode: undefined,
        fields,
        names: ['test.sub', 'test1'],
      })

      await result.current.trigger(['test.sub', 'test1'])

      expect(resolver).toHaveBeenNthCalledWith(3, defaultValues, undefined, {
        criteriaMode: undefined,
        fields,
        names: ['test.sub', 'test1'],
      })
    })

    test('trigger should not throw warn', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>())
      await act(async () => expect(await result.current.trigger('test')).toBeTruthy())
    })
  })
})
