import { act, renderHook } from '@testing-library/react'
import { describe, test, expect } from 'vitest'

import { useForm } from '../../src/use-form'

describe('useForm', () => {
  describe('unmount', () => {
    test('does not unregister errors when unmounted', async () => {
      const { result, unmount } = renderHook(() => useForm<{ test: string }>())

      result.current.formState.errors
      result.current.register('test', { required: true })

      await act(async () => {
        await result.current.handleSubmit(() => {})({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent)
      })

      expect(result.current.formState.errors.test).toBeDefined()

      unmount()

      expect(result.current.formState.errors.test).toBeDefined()
    })
  })
})
