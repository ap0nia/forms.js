import { act, render, renderHook, waitFor } from '@testing-library/react'
import { describe, test, expect } from 'vitest'

import { useForm } from '../../src/use-form'

describe('useForm', () => {
  describe('mount', () => {
    test('updates isValid when mounting and unmounting inputs when shouldUnregister is true', async () => {
      const hook = renderHook(() =>
        useForm({
          shouldUnregister: true,
          defaultValues: { test: 'Test' },
          mode: 'onChange',
          resolver: async (values) => {
            if (!values.test) {
              return {
                values: {},
                errors: {
                  test: {
                    type: 'required',
                  },
                },
              }
            }

            return {
              values,
              errors: {},
            }
          },
        }),
      )

      hook.result.current.formState.isValid

      const input = await act(() =>
        render(<input id="test" {...hook.result.current.register('test')} />),
      )

      expect(hook.result.current.control.state.value.isValid).toBeTruthy()

      input.unmount()

      hook.result.current.control.cleanup()

      await waitFor(() => expect(hook.result.current.control.state.value.isValid).toBeFalsy())

      await act(() => render(<input id="test" {...hook.result.current.register('test')} />))

      expect(hook.result.current.control.state.value.isValid).toBeTruthy()
    })
  })
})
