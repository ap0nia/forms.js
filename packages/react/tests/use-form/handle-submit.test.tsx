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

    test('does not clear errors for non checkbox parent inputs', async () => {
      const hook = renderHook(() =>
        useForm<{
          checkbox: [{ test: string }, { test1: string }]
        }>({
          mode: 'onChange',
          resolver: (data) => {
            return {
              errors: {
                ...(!data.checkbox[0].test || !data.checkbox[1].test1
                  ? {
                      checkbox: [
                        {
                          ...(!data.checkbox[0].test
                            ? { test: { type: 'error', message: 'wrong' } }
                            : {}),
                          ...(!data.checkbox[1].test1
                            ? { test1: { type: 'error', message: 'wrong' } }
                            : {}),
                        },
                      ],
                    }
                  : {}),
              },
              values: {},
            }
          },
        }),
      )

      const checkbox = render(
        <input type={'checkbox'} {...hook.result.current.register(`checkbox.0.test`)} />,
      )
      render(<input {...hook.result.current.register(`checkbox.1.test1`)} />)

      const handleSubmit = hook.result.current.handleSubmit()

      await handleSubmit()

      expect(hook.result.current.control.stores.errors.value).toEqual({
        checkbox: [
          {
            test: { type: 'error', message: 'wrong' },
            test1: { type: 'error', message: 'wrong' },
          },
        ],
      })

      fireEvent.click(getByRole(checkbox.container, 'checkbox'))

      await handleSubmit()

      expect(hook.result.current.control.stores.errors.value).toEqual({
        checkbox: [
          {
            test1: { type: 'error', message: 'wrong' },
          },
        ],
      })
    })

    test.only('has formState.isValid equals true with defined default values after executing resolver', async () => {
      const hook = renderHook(() =>
        useForm({
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

      const input = render(<input id="test" {...hook.result.current.register('test')} />)

      await waitFor(() => expect(hook.result.current.control.state.value.isValid).toBeTruthy())

      input.unmount()

      render(<input id="test" {...hook.result.current.register('test')} />)

      expect(hook.result.current.control.state.value.isValid).toBeTruthy()
    })
  })
})
