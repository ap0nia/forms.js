import { act, fireEvent, getByRole, render, renderHook, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'

import { useForm } from '../../src/use-form'
import { expectWaitForError } from '../expect-wait-for-error'

describe('control', () => {
  describe('handleChange', () => {
    test('does not validate on input when validation and reValidation modes are onChange', async () => {
      const hook = renderHook(() => useForm())

      const fn = vi.fn()

      hook.result.current.control.state.proxy.errors
      hook.result.current.control.state.subscribe(fn, undefined, false)

      render(
        <input type="text" {...hook.result.current.register('test', { required: 'required' })} />,
      )

      fireEvent.input(getByRole(document.body, 'textbox'), { target: { value: '' } })

      expect(hook.result.current.control.stores.errors.value['test']).toBeUndefined()

      await act(hook.result.current.handleSubmit())

      expect(hook.result.current.control.stores.errors.value['test']).toEqual(
        expect.objectContaining({ message: 'required' }),
      )

      fireEvent.input(getByRole(document.body, 'textbox'), { target: { value: '' } })

      await waitFor(() =>
        expect(hook.result.current.control.stores.errors.value['test']).toEqual(
          expect.objectContaining({ message: 'required' }),
        ),
      )

      await expectWaitForError(() => expect(fn).toHaveBeenCalledTimes(2))
      expect(fn).toHaveBeenCalledTimes(1)
    })

    test('revalidates on change', async () => {
      const hook = renderHook(() => useForm())

      const input = render(
        <input type="text" {...hook.result.current.register('test', { required: 'required' })} />,
      )

      fireEvent.input(getByRole(input.container, 'textbox'), { target: { value: 'test' } })

      await act(hook.result.current.handleSubmit())

      expect(hook.result.current.control.stores.errors.value['test']).toBeUndefined()

      fireEvent.input(getByRole(input.container, 'textbox'), { target: { value: '' } })

      await waitFor(() =>
        expect(hook.result.current.control.stores.errors.value['test']).toBeDefined(),
      )
    })

    test('revalidates on blur', async () => {
      const hook = renderHook(() => useForm({ reValidateMode: 'onBlur' }))

      const input = render(
        <input type="text" {...hook.result.current.register('test', { required: 'required' })} />,
      )

      fireEvent.input(getByRole(input.container, 'textbox'), { target: { value: 'test' } })

      await act(hook.result.current.handleSubmit())

      fireEvent.input(getByRole(input.container, 'textbox'), { target: { value: '' } })

      expect(hook.result.current.control.stores.errors.value['test']).toBeUndefined()

      fireEvent.blur(getByRole(input.container, 'textbox'))

      await waitFor(() =>
        expect(hook.result.current.control.stores.errors.value['test']).toBeDefined(),
      )
    })

    test('adds error after submission even if validation mode is onChange', async () => {
      const hook = renderHook(() => useForm({ mode: 'onChange' }))

      const input = render(
        <input type="text" {...hook.result.current.register('test', { required: 'required' })} />,
      )

      fireEvent.input(getByRole(input.container, 'textbox'), { target: { value: '' } })

      await act(hook.result.current.handleSubmit())

      expect(hook.result.current.control.stores.errors.value['test']).toBeDefined()
    })

    test('does not add errors after blur event if validation mode is onChange', async () => {
      const hook = renderHook(() => useForm({ mode: 'onChange' }))

      const input = render(
        <input type="text" {...hook.result.current.register('test', { required: 'required' })} />,
      )

      fireEvent.input(getByRole(input.container, 'textbox'), { target: { value: '' } })

      fireEvent.blur(getByRole(input.container, 'textbox'))

      // Ensure that the error is never added after blur event.
      await expectWaitForError(() =>
        expect(hook.result.current.control.stores.errors.value['test']).toBeDefined(),
      )
    })

    test('adds error after blur event if validation mode is onBlur', async () => {
      const hook = renderHook(() => useForm({ mode: 'onBlur' }))

      const input = render(
        <input type="text" {...hook.result.current.register('test', { required: 'required' })} />,
      )

      fireEvent.input(getByRole(input.container, 'textbox'), { target: { value: '' } })

      fireEvent.blur(getByRole(input.container, 'textbox'))

      await waitFor(() =>
        expect(hook.result.current.control.stores.errors.value['test']).toBeDefined(),
      )
    })

    test('adds error after submission even if validation mode is onBlur', async () => {
      const hook = renderHook(() => useForm({ mode: 'onBlur' }))

      const input = render(
        <input type="text" {...hook.result.current.register('test', { required: 'required' })} />,
      )

      fireEvent.input(getByRole(input.container, 'textbox'), { target: { value: '' } })

      await act(hook.result.current.handleSubmit())

      expect(hook.result.current.control.stores.errors.value['test']).toBeDefined()
    })

    test('does not add error after change event if validation mode is onBlur', async () => {
      const hook = renderHook(() => useForm({ mode: 'onBlur' }))

      const input = render(
        <input type="text" {...hook.result.current.register('test', { required: 'required' })} />,
      )

      fireEvent.input(getByRole(input.container, 'textbox'), { target: { value: '' } })

      // Ensure that the error is never added after change event.
      await expectWaitForError(() =>
        expect(hook.result.current.control.stores.errors.value['test']).toBeDefined(),
      )
    })

    test('does not validate form after input or change events when validationMode is onTouched', async () => {
      const hook = renderHook(() =>
        useForm<{
          test: string
        }>({
          mode: 'onTouched',
        }),
      )

      const input = render(
        <input
          type="text"
          {...hook.result.current.register('test', { required: 'This is required.' })}
        />,
      )

      fireEvent.input(getByRole(input.container, 'textbox'))

      expectWaitForError(() =>
        expect(hook.result.current.control.stores.errors.value.test?.message).toBeDefined(),
      )

      fireEvent.change(getByRole(input.container, 'textbox'))

      expectWaitForError(() =>
        expect(hook.result.current.control.stores.errors.value.test?.message).toBeDefined(),
      )
    })

    test('validates form after input is blurred when validationMode is onTouched', async () => {
      const hook = renderHook(() =>
        useForm<{
          test: string
        }>({
          mode: 'onTouched',
        }),
      )

      const input = render(
        <input
          type="text"
          {...hook.result.current.register('test', { required: 'This is required.' })}
        />,
      )

      fireEvent.blur(getByRole(input.container, 'textbox'))

      await waitFor(() =>
        expect(hook.result.current.control.stores.errors.value.test?.message).toEqual(
          'This is required.',
        ),
      )

      fireEvent.input(getByRole(input.container, 'textbox'), {
        target: {
          value: 'test',
        },
      })

      await waitFor(() =>
        expect(hook.result.current.control.stores.errors.value.test?.message).toBeUndefined(),
      )
    })

    test('validates form after input and change events after the field has been touched once when validationMode is onTouched', async () => {
      const hook = renderHook(() =>
        useForm<{
          test: string
        }>({
          mode: 'onTouched',
        }),
      )

      const input = render(
        <input
          type="text"
          {...hook.result.current.register('test', { required: 'This is required.' })}
        />,
      )

      fireEvent.blur(getByRole(input.container, 'textbox'))

      await waitFor(() =>
        expect(hook.result.current.control.stores.errors.value.test?.message).toEqual(
          'This is required.',
        ),
      )

      fireEvent.input(getByRole(input.container, 'textbox'), {
        target: {
          value: 'test',
        },
      })

      await waitFor(() =>
        expect(hook.result.current.control.stores.errors.value.test?.message).toBeUndefined(),
      )

      fireEvent.change(getByRole(input.container, 'textbox'), {
        target: {
          value: '',
        },
      })

      await waitFor(() =>
        expect(hook.result.current.control.stores.errors.value.test?.message).toEqual(
          'This is required.',
        ),
      )
    })

    test('validates form on focusOut when validationMode is onTouched', async () => {
      const hook = renderHook(() =>
        useForm<{
          test: string
        }>({
          mode: 'onTouched',
        }),
      )

      const input = render(
        <input
          type="text"
          {...hook.result.current.register('test', { required: 'This is required.' })}
        />,
      )

      fireEvent.focusOut(getByRole(input.container, 'textbox'))
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
