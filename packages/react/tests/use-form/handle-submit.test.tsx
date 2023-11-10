import { render, renderHook } from '@testing-library/react'
import { describe, test, expect } from 'vitest'

import { useForm } from '../../src/use-form'

describe('useForm', () => {
  describe('handleSubmit', () => {
    test('only validates inputs that are currently registered', async () => {
      const hook = renderHook(() =>
        useForm<{ a: string; b: string }>({
          shouldUnregister: true,
          resetOptions: {
            keepValues: false,
            keepErrors: false,
            keepDirty: false,
            keepTouched: false,
          },
        }),
      )

      const a = render(<input {...hook.result.current.register('a', { required: true })} />)
      const b = render(<input {...hook.result.current.register('b', { required: true })} />)

      const handleSubmit = hook.result.current.handleSubmit()

      await handleSubmit()

      expect(hook.result.current.control.stores.errors.value.a).toBeDefined()
      expect(hook.result.current.control.stores.errors.value.b).toBeDefined()

      a.unmount()
      hook.result.current.control.cleanup()

      await handleSubmit()

      expect(hook.result.current.control.stores.errors.value.a).toBeUndefined()
      expect(hook.result.current.control.stores.errors.value.b).toBeDefined()

      b.unmount()
      hook.result.current.control.cleanup()

      await handleSubmit()

      expect(hook.result.current.control.stores.errors.value.a).toBeUndefined()
      expect(hook.result.current.control.stores.errors.value.b).toBeUndefined()
    })
  })
})
