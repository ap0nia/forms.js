import { act, renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { useForm } from '../src/use-form'

describe('useForm', () => {
  describe('when component unMount', () => {
    it('should call unSubscribe', () => {
      const { result, unmount } = renderHook(() => useForm<{ test: string }>())

      result.current.register('test')
      unmount()

      expect(result.current.getValues()).toEqual({})
    })

    it('should remain array field values when inputs gets unmounted', () => {
      const { result, unmount } = renderHook(() => useForm<{ test: string[] }>())

      result.current.register('test.0')
      result.current.register('test.1')
      result.current.register('test.2')

      unmount()

      expect(result.current.getValues()).toEqual({
        test: [undefined, undefined, undefined],
      })
    })

    it.only('should only unregister errors when unregister method invoked', async () => {
      const { result } = renderHook(() =>
        useForm<{
          test: string
        }>(),
      )

      result.current.formState.errors
      result.current.register('test', { required: true })

      await act(async () => {
        await result.current.handleSubmit(() => {})({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent)
      })

      expect(result.current.formState.errors.test).toBeDefined()

      await act(async () => {
        result.current.unregister('test')
      })

      expect(result.current.formState.errors.test).not.toBeDefined()
    })
  })
})
