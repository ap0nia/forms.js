import { act, renderHook } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'

import { useForm } from '../../src/use-form'

describe('useForm', () => {
  describe('updateValid', () => {
    test('calls resolver with default values if default value is defined', async () => {
      type FormValues = {
        test: string
      }

      const resolver = vi.fn(async (data: FormValues) => {
        return {
          values: data,
          errors: {},
        }
      })

      const { result } = renderHook(() =>
        useForm<FormValues>({
          resolver,
          defaultValues: { test: 'default' },
        }),
      )

      const { ref } = result.current.register('test')

      ref({ target: { value: '' } } as any)

      await act(async () => {
        await result.current.trigger()
      })

      expect(resolver).toHaveBeenCalledWith(
        {
          test: 'default',
        },
        undefined,
        {
          criteriaMode: undefined,
          fields: {
            test: {
              mount: true,
              name: 'test',
              ref: {
                target: {
                  value: '',
                },
                value: 'default',
              },
            },
          },
          names: ['test'],
        },
      )
    })

    test('should be called resolver with field values if value is undefined', async () => {
      type FormValues = {
        test: string
      }

      const resolver = vi.fn(async (data: FormValues) => {
        return {
          values: data,
          errors: {},
        }
      })

      const { result } = renderHook(() =>
        useForm<FormValues>({
          resolver,
        }),
      )

      result.current.register('test')

      result.current.setValue('test', 'value')

      result.current.trigger()

      expect(resolver).toHaveBeenCalledWith({ test: 'value' }, undefined, {
        criteriaMode: undefined,
        fields: {
          test: {
            mount: true,
            name: 'test',
            ref: { name: 'test', value: 'value' },
          },
        },
        names: ['test'],
      })
    })
  })
})
