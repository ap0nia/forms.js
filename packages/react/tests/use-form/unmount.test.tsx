import { act, fireEvent, getByRole, render, renderHook } from '@testing-library/react'
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

    it('should remove and unregister inputs when inputs gets unmounted', async () => {
      const hook = renderHook(() =>
        useForm({
          shouldUnregister: true,
          defaultValues: {
            test: 'bill',
            test1: 'bill1',
            test2: [{ value: 'bill2' }],
          },
        }),
      )

      const a = render(<input {...hook.result.current.register('test')} />)
      const b = render(<input {...hook.result.current.register('test1')} />)
      const c = render(<input {...hook.result.current.register('test2.0.value')} />)

      const handleSubmit = hook.result.current.handleSubmit()

      await handleSubmit()

      expect(hook.result.current.control.stores.values.value).toEqual({
        test: 'bill',
        test1: 'bill1',
        test2: [
          {
            value: 'bill2',
          },
        ],
      })

      a.unmount()
      b.unmount()
      c.unmount()

      hook.result.current.control.cleanup()

      await handleSubmit()

      expect(hook.result.current.control.stores.values.value).toEqual({})
    })

    test('preserves previous errors even when values change', async () => {
      const hook = renderHook(() =>
        useForm<{
          firstName: string
          moreDetail: boolean
        }>({
          shouldUnregister: true,
        }),
      )

      const firstName = render(
        <input {...hook.result.current.register('firstName', { maxLength: 3 })} />,
      )
      const moreDetail = render(
        <input type="checkbox" {...hook.result.current.register('moreDetail')} />,
      )

      fireEvent.change(getByRole(firstName.container, 'textbox'), {
        target: {
          value: 'testtesttest',
        },
      })

      const handleSubmit = hook.result.current.handleSubmit()

      await handleSubmit()

      expect(hook.result.current.control.stores.errors.value.firstName).toMatchObject({
        type: 'maxLength',
      })

      fireEvent.click(getByRole(moreDetail.container, 'checkbox'))

      expect(hook.result.current.control.stores.values.value.moreDetail).toBeDefined()

      await handleSubmit()

      expect(hook.result.current.control.stores.errors.value.firstName).toMatchObject({
        type: 'maxLength',
      })
    })

    test('only unregisters input after all child checkboxes are unmounted', async () => {
      const hook = renderHook(() => useForm({ shouldUnregister: true }))

      const test1 = render(
        <input {...hook.result.current.register('test')} type="radio" value="1" />,
      )
      const test2 = render(
        <input {...hook.result.current.register('test')} type="radio" value="2" />,
      )

      test1.unmount()
      hook.result.current.control.cleanup()

      const handleSubmit = hook.result.current.handleSubmit()

      await act(handleSubmit)

      expect(hook.result.current.control.stores.values.value).toEqual({ test: null })

      test2.unmount()
      hook.result.current.control.cleanup()

      await act(handleSubmit)

      expect(hook.result.current.control.stores.values.value).toEqual({})
    })

    test('should unsubscribe to all subject when hook unmounts', () => {
      const hook = renderHook(() => useForm())

      expect(hook.result.current.control.state.writable.subscribers.size).toBeTruthy()

      hook.unmount()

      expect(hook.result.current.control.state.writable.subscribers.size).toBeFalsy()
    })
  })
})
