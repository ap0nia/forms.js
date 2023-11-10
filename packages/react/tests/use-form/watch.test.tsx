import { act, fireEvent, getByRole, render, renderHook } from '@testing-library/react'
import { describe } from 'vitest'

import { useForm } from '../../src/use-form'
import { expectWaitForError } from '../expect-wait-for-error'

describe('control', () => {
  describe('watch', () => {
    test('returns undefined or null values', () => {
      const hook = renderHook(() => useForm())

      hook.result.current.register('test')
      hook.result.current.register('test1')

      hook.result.current.setValue('test', undefined)
      hook.result.current.setValue('test1', null)

      expect(hook.result.current.watch('test')).toBeUndefined()
      expect(hook.result.current.watch('test1')).toBeNull()
    })

    test('re-renders if watching all', async () => {
      const hook = renderHook(() => useForm())

      hook.result.current.watch()

      const fn = vi.fn()

      hook.result.current.control.state.subscribe(fn, undefined, false)

      const input = render(<input {...hook.result.current.register('test')} />)

      await act(() =>
        fireEvent.input(getByRole(input.container, 'textbox'), { target: { value: 'test' } }),
      )

      expectWaitForError(() => expect(fn).toHaveBeenCalledTimes(3))

      // Renders once synchronously at the beginning of "handleChange" to change the values,
      // and once more at the end to update the component again.
      expect(fn).toHaveBeenCalledTimes(2)
    })

    test('re-renders if watched field changes', async () => {
      const hook = renderHook(() => useForm())

      hook.result.current.watch('test')

      const fn = vi.fn()

      hook.result.current.control.state.subscribe(fn, undefined, false)

      const input = render(<input {...hook.result.current.register('test')} />)

      await act(() =>
        fireEvent.input(getByRole(input.container, 'textbox'), { target: { value: 'test' } }),
      )

      expectWaitForError(() => expect(fn).toHaveBeenCalledTimes(2))

      // Only renders once to change the values.
      // None of the subsequent store changes are being listened to, i.e. "errors", "touched", etc.
      expect(fn).toHaveBeenCalledTimes(1)
    })

    test('does not re-render if un-watched field changes', async () => {
      const hook = renderHook(() => useForm())

      hook.result.current.watch('do-not-watch')

      const fn = vi.fn()

      hook.result.current.control.state.subscribe(fn, undefined, false)

      const input = render(<input {...hook.result.current.register('test')} />)

      await act(() =>
        fireEvent.input(getByRole(input.container, 'textbox'), { target: { value: 'test' } }),
      )

      expectWaitForError(() => expect(fn).toHaveBeenCalled())
    })

    test('re-renders if any field in an watched array field changes', async () => {
      const hook = renderHook(() => useForm<{ test: string[] }>())

      hook.result.current.watch('test')

      const fn = vi.fn()

      hook.result.current.control.state.subscribe(fn, undefined, false)

      const input = render(<input {...hook.result.current.register('test.0')} />)
      render(<input {...hook.result.current.register('test.1')} />)
      render(<input {...hook.result.current.register('test.2')} />)

      fireEvent.input(getByRole(input.container, 'textbox'), {
        target: {
          value: 'test',
        },
      })

      await expectWaitForError(() => expect(fn).toHaveBeenCalledTimes(2))
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})