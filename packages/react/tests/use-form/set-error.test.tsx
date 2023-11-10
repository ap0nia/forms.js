import { fireEvent, getByRole, render, renderHook } from '@testing-library/react'
import { describe, test, expect } from 'vitest'

import { useForm } from '../../src/use-form'

describe('useForm', () => {
  describe('setError', () => {
    test('updates the error message', async () => {
      const hook = renderHook(() =>
        useForm<{
          test: string
        }>(),
      )

      const input = render(
        <input
          {...hook.result.current.register('test', {
            maxLength: {
              message: 'max',
              value: 3,
            },
          })}
          placeholder="test"
          type="text"
        />,
      )

      hook.result.current.setError('test', {
        type: 'data',
        message: 'data',
      })

      expect(hook.result.current.control.stores.errors.value.test?.message).toBeDefined()

      fireEvent.input(getByRole(input.container, 'textbox'), { target: { value: 'test' } })

      expect(hook.result.current.control.stores.errors.value.test?.message).toEqual('data')
    })
  })
})
