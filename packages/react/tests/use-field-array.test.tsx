import { renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'

import { FormProvider } from '../src/form-provider'
import { useFieldArray } from '../src/use-field-array'
import { useForm } from '../src/use-form'

let i = 0

function idGenerator() {
  return String(i++)
}

describe('useFieldArray', () => {
  beforeEach(() => {
    i = 0
  })

  describe('initialize', () => {
    it('should return default fields value', () => {
      const { result } = renderHook(() => {
        const { control } = useForm()
        return useFieldArray({
          control,
          name: 'test',
        })
      })

      expect(result.current.fields).toEqual([])
    })

    it('should populate default values into fields', () => {
      const { result } = renderHook(() => {
        const { control } = useForm({
          defaultValues: { test: [{ test: '1' }, { test: '2' }] },
        })
        return useFieldArray({
          idGenerator,
          control,
          name: 'test',
        })
      })

      expect(result.current.fields).toEqual([
        { test: '1', id: '0' },
        { test: '2', id: '1' },
      ])
    })

    it('should render with FormProvider', () => {
      const Provider = ({ children }: { children: React.ReactNode }) => {
        const methods = useForm()
        return <FormProvider {...methods}>{children}</FormProvider>
      }
      const { result } = renderHook(() => useFieldArray({ name: 'test' }), {
        wrapper: Provider,
      })
      expect(result.error).toBeUndefined()
    })
  })
})
