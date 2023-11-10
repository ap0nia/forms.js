import { fireEvent, getByRole, render, renderHook, waitFor } from '@testing-library/react'
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

    test('triggers and clears errors for group errors object', async () => {
      const hook = renderHook(() =>
        useForm<{
          checkbox: string[]
        }>({
          mode: 'onChange',
          resolver: (data) => {
            return {
              errors: {
                ...(data.checkbox.every((value) => !value)
                  ? { checkbox: { type: 'error', message: 'wrong' } }
                  : {}),
              },
              values: {},
            }
          },
        }),
      )

      const createCheckbox = (value: number, index: number) =>
        render(
          <input
            type="checkbox"
            {...hook.result.current.register(`checkbox.${index}` as const)}
            value={value}
          />,
        )

      const input = createCheckbox(1, 0)

      fireEvent.click(getByRole(input.container, 'checkbox'))
      fireEvent.click(getByRole(input.container, 'checkbox'))

      await waitFor(() =>
        expect(hook.result.current.control.stores.errors.value).toEqual({
          checkbox: { type: 'error', message: 'wrong' },
        }),
      )

      fireEvent.click(getByRole(input.container, 'checkbox'))

      await waitFor(() => expect(hook.result.current.control.stores.errors.value).toEqual({}))

      fireEvent.click(getByRole(input.container, 'checkbox'))

      await hook.result.current.handleSubmit()()

      expect(hook.result.current.control.stores.errors.value).toEqual({
        checkbox: { type: 'error', message: 'wrong' },
      })

      fireEvent.click(getByRole(input.container, 'checkbox'))

      await waitFor(() => expect(hook.result.current.control.stores.errors.value).toEqual({}))
    })
  })
})
