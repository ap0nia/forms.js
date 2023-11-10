import { act, fireEvent, render, renderHook, getByRole } from '@testing-library/react'
import { useEffect } from 'react'
import { describe, test, expect, vi } from 'vitest'

import { useForm } from '../../src/use-form'

describe('control', () => {
  describe('unregister', () => {
    test('unsets value when root keepValues is undefined or false', () => {
      const hook = renderHook(() =>
        useForm({
          shouldUnregister: true,
          resetOptions: { keepValues: false },
        }),
      )

      const component = render(<input {...hook.result.current.register('test')} />)

      expect(hook.result.current.getValues()).toEqual({ test: '' })

      component.unmount()
      hook.unmount()

      expect(hook.result.current.getValues()).toEqual({})
    })

    test('unsets array value when root keepValues is undefined or false', () => {
      const hook = renderHook(() =>
        useForm({
          shouldUnregister: true,
        }),
      )

      const component = render(
        <div>
          <input {...hook.result.current.register('test.0')} />
          <input {...hook.result.current.register('test.1')} />
          <input {...hook.result.current.register('test.2')} />
        </div>,
      )

      expect(hook.result.current.getValues()).toEqual({ test: ['', '', ''] })

      component.unmount()
      hook.unmount()

      expect(hook.result.current.getValues()).toEqual({})
    })

    test('does not unset array value when root keepValues is true', () => {
      const hook = renderHook(() =>
        useForm({
          shouldUnregister: true,
          resetOptions: { keepValues: true },
        }),
      )

      const component = render(
        <div>
          <input {...hook.result.current.register('test.0')} />
          <input {...hook.result.current.register('test.1')} />
          <input {...hook.result.current.register('test.2')} />
        </div>,
      )

      expect(hook.result.current.getValues()).toEqual({ test: ['', '', ''] })

      component.unmount()
      hook.unmount()

      expect(hook.result.current.getValues()).toEqual({ test: ['', '', ''] })
    })

    test('does not unset value when root keepValues is true', () => {
      const hook = renderHook(() =>
        useForm({
          shouldUnregister: true,
          resetOptions: { keepValues: true },
        }),
      )

      const component = render(<input {...hook.result.current.register('test')} />)

      expect(hook.result.current.getValues()).toEqual({ test: '' })

      component.unmount()
      hook.unmount()

      expect(hook.result.current.getValues()).toEqual({ test: '' })
    })

    test('unsets field when root keepValues is undefined or false', () => {
      const hook = renderHook(() =>
        useForm({
          shouldUnregister: true,
          resetOptions: { keepValues: false },
        }),
      )

      const component = render(<input {...hook.result.current.register('test')} />)

      expect(hook.result.current.control._fields.test).toBeDefined()

      component.unmount()
      hook.unmount()

      expect(hook.result.current.control._fields.test).toBeUndefined()
    })

    test('does not unset field when root keepValues is true', () => {
      const hook = renderHook(() =>
        useForm({
          shouldUnregister: true,
          resetOptions: { keepValues: true },
        }),
      )

      const component = render(<input {...hook.result.current.register('test')} />)

      expect(hook.result.current.control._fields.test).toBeDefined()

      component.unmount()
      hook.unmount()

      expect(hook.result.current.control._fields.test).toBeDefined()
    })

    test('unsets error when root keepErrors is undefined or false', () => {
      const hook = renderHook(() =>
        useForm({
          shouldUnregister: true,
          resetOptions: { keepErrors: false },
        }),
      )

      const component = render(<input {...hook.result.current.register('test')} />)

      hook.result.current.control.stores.errors.set({ test: {} })

      component.unmount()
      hook.unmount()

      expect(hook.result.current.control.stores.errors.value.test).toBeUndefined()
    })

    test('does not unset error when root keepErrors is true', () => {
      const hook = renderHook(() =>
        useForm({
          shouldUnregister: true,
          resetOptions: { keepErrors: true },
        }),
      )

      const component = render(<input {...hook.result.current.register('test')} />)

      hook.result.current.control.stores.errors.set({ test: {} })

      component.unmount()
      hook.unmount()

      expect(hook.result.current.control.stores.errors.value.test).toBeDefined()
    })

    test('unsets dirty field when root keepDirty is undefined or false', () => {
      const hook = renderHook(() =>
        useForm({
          shouldUnregister: true,
          resetOptions: { keepDirty: false },
        }),
      )

      const component = render(<input {...hook.result.current.register('test')} />)

      hook.result.current.control.stores.dirtyFields.set({ test: true })

      component.unmount()
      hook.unmount()

      expect(hook.result.current.control.stores.dirtyFields.value.test).toBeUndefined()
    })

    test('does not unset dirty field when root keepDirty is true', () => {
      const hook = renderHook(() =>
        useForm({
          shouldUnregister: true,
          resetOptions: { keepDirty: true },
        }),
      )

      const component = render(<input {...hook.result.current.register('test')} />)

      hook.result.current.control.stores.dirtyFields.set({ test: true })

      component.unmount()
      hook.unmount()

      expect(hook.result.current.control.stores.dirtyFields.value.test).toBeDefined()
    })

    test('unsets touched field when root keepTouched is undefined or false', () => {
      const hook = renderHook(() =>
        useForm({
          shouldUnregister: true,
          resetOptions: { keepTouched: false },
        }),
      )

      const component = render(<input {...hook.result.current.register('test')} />)

      hook.result.current.control.stores.touchedFields.set({ test: true })

      component.unmount()
      hook.unmount()

      expect(hook.result.current.control.stores.touchedFields.value.test).toBeUndefined()
    })

    test('does not unset touched field when root keepTouched is true', () => {
      const hook = renderHook(() =>
        useForm({
          shouldUnregister: true,
          resetOptions: { keepTouched: true },
        }),
      )

      const component = render(<input {...hook.result.current.register('test')} />)

      hook.result.current.control.stores.touchedFields.set({ test: true })

      component.unmount()
      hook.unmount()

      expect(hook.result.current.control.stores.touchedFields.value.test).toBeDefined()
    })

    test('unsets relevant store values and notifies once during unmount', () => {
      const hook = renderHook(() =>
        useForm({
          shouldUnregister: true,
          resetOptions: {
            keepValues: false,
            keepErrors: false,
            keepDirty: false,
            keepTouched: false,
          },
        }),
      )

      const fn = vi.fn()

      hook.result.current.control.state.subscribe(fn, undefined, false)

      const component = render(
        <>
          <input {...hook.result.current.register('test')} />
          <input {...hook.result.current.register('test2')} />
        </>,
      )

      hook.result.current.control.stores.errors.set({ test: {} })
      hook.result.current.control.stores.dirtyFields.set({ test: true })
      hook.result.current.control.stores.touchedFields.set({ test: true })

      component.unmount()
      hook.unmount()

      expect(hook.result.current.control.stores.errors.value).toEqual({})
      expect(hook.result.current.control.stores.dirtyFields.value).toEqual({})
      expect(hook.result.current.control.stores.touchedFields.value).toEqual({})
      expect(hook.result.current.control.stores.values.value).toEqual({})

      expect(fn).toHaveBeenCalledOnce()
    })

    test('notifies each time unregister is called manually', () => {
      const hook = renderHook(() =>
        useForm({
          shouldUnregister: true,
          resetOptions: {
            keepValues: false,
            keepErrors: false,
            keepDirty: false,
            keepTouched: false,
          },
        }),
      )

      const fn = vi.fn()

      hook.result.current.control.state.subscribe(fn, undefined, false)

      function Component() {
        useEffect(() => {
          hook.result.current.unregister('test')
          hook.result.current.unregister('test2')
        }, [])

        return (
          <>
            <input {...hook.result.current.register('test')} />
            <input {...hook.result.current.register('test2')} />
          </>
        )
      }

      render(<Component />).unmount()

      expect(fn).toHaveBeenCalledTimes(2)
    })

    test('keeps track of submit count', async () => {
      const hook = renderHook(() =>
        useForm<{ a: string; show: boolean }>({
          shouldUnregister: true,
          resetOptions: {
            keepValues: false,
            keepErrors: false,
            keepDirty: false,
            keepTouched: false,
          },
        }),
      )

      const a = render(<input {...hook.result.current.register('a', { maxLength: 3 })} />)
      const b = render(<input type="checkbox" {...hook.result.current.register('show')} />)

      fireEvent.change(getByRole(a.container, 'textbox'), { target: { value: 'test' } })

      const handleSubmit = hook.result.current.handleSubmit()

      await act(handleSubmit)

      expect(hook.result.current.control.stores.submitCount.value).toEqual(1)
      expect(hook.result.current.control.stores.errors.value.a).toBeDefined()

      fireEvent.click(getByRole(b.container, 'checkbox'))

      expect(hook.result.current.control.stores.submitCount.value).toEqual(1)
      expect(hook.result.current.control.stores.errors.value.a).toBeDefined()
      expect(hook.result.current.watch('show')).toEqual(true)

      await act(handleSubmit)

      expect(hook.result.current.control.stores.submitCount.value).toEqual(2)
      expect(hook.result.current.control.stores.errors.value.a).toBeDefined()
      expect(hook.result.current.watch('show')).toEqual(true)
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
  })
})
