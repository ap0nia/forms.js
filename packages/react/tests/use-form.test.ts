import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { act } from '@testing-library/react-hooks'

import { useForm } from '../src/use-form'

describe('useForm', () => {
  describe('when component unMount', () => {
    it('should call unSubscribe', () => {
      const { result, unmount } = renderHook(() => useForm<{ test: string }>())

      result.current.register('test')

      unmount()

      expect(result.current.getValues()).toEqual({})
    })
  })

  it('should remain array field values when inputs gets unmounted', () => {
    const { result, unmount } = renderHook(() => useForm<{ test: string[] }>())

    result.current.register('test.0')
    result.current.register('test.1')
    result.current.register('test.2')

    unmount()

    result.current.formState.errors

    expect(result.current.getValues()).toEqual({
      test: [undefined, undefined, undefined],
    })
  })

  // it('should not unregister errors when unmounted', async () => {
  //   const { result, unmount } = renderHook(() =>
  //     useForm<{
  //       test: string
  //     }>(),
  //   )

  //   result.current.formState.errors
  //   result.current.register('test', { required: true })

  //   await act(async () => {
  //     await result.current.handleSubmit(() => {})(new Event(''))
  //   })

  //   expect(result.current.formState.errors.test).toBeDefined()

  //   unmount()

  //   expect(result.current.formState.errors.test).toBeDefined()
  // })
})
