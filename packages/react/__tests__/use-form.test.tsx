import { renderHook } from '@testing-library/react'
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
  })
})
