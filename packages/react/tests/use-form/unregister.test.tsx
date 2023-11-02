import { render, renderHook } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'

import { useForm } from '../../src/use-form'

describe('control', () => {
  describe('unregister', () => {
    describe('works correctly when unmounting and shouldUnregister is true', () => {
      test('unsets value when root keepValues is undefined or false', async () => {
        const hook = renderHook(() =>
          useForm({
            shouldUnregister: true,
            defaultValues: { test: 'test' },
            resetOptions: { keepValues: false },
          }),
        )

        const component = render(<input {...hook.result.current.register('test')} />)

        expect(hook.result.current.getValues()).toEqual({ test: 'test' })

        component.unmount()
        hook.unmount()

        expect(hook.result.current.getValues()).toEqual({})
      })

      test('does not unset value when root keepValues is true', async () => {
        const hook = renderHook(() =>
          useForm({
            shouldUnregister: true,
            defaultValues: { test: 'test' },
            resetOptions: { keepValues: true },
          }),
        )

        const component = render(<input {...hook.result.current.register('test')} />)

        expect(hook.result.current.getValues()).toEqual({ test: 'test' })

        component.unmount()
        hook.unmount()

        expect(hook.result.current.getValues()).toEqual({ test: 'test' })
      })

      test('unsets field when root keepValues is undefined or false', async () => {
        const hook = renderHook(() =>
          useForm({
            shouldUnregister: true,
            defaultValues: { test: 'test' },
            resetOptions: { keepValues: false },
          }),
        )

        const component = render(<input {...hook.result.current.register('test')} />)

        expect(hook.result.current.control._fields.test).toBeDefined()

        component.unmount()
        hook.unmount()

        expect(hook.result.current.control._fields.test).toBeUndefined()
      })

      test('does not unset field when root keepValues is true', async () => {
        const hook = renderHook(() =>
          useForm({
            shouldUnregister: true,
            defaultValues: { test: 'test' },
            resetOptions: { keepValues: true },
          }),
        )

        const component = render(<input {...hook.result.current.register('test')} />)

        expect(hook.result.current.control._fields.test).toBeDefined()

        component.unmount()
        hook.unmount()

        expect(hook.result.current.control._fields.test).toBeDefined()
      })

      test('unsets error when root keepErrors is undefined or false', async () => {
        const hook = renderHook(() =>
          useForm({
            shouldUnregister: true,
            defaultValues: { test: 'test' },
            resetOptions: { keepErrors: false },
          }),
        )

        const component = render(<input {...hook.result.current.register('test')} />)

        hook.result.current.control.stores.errors.set({ test: {} })

        component.unmount()
        hook.unmount()

        expect(hook.result.current.control.stores.errors.value.test).toBeUndefined()
      })

      test('does not unset error when root keepErrors is true', async () => {
        const hook = renderHook(() =>
          useForm({
            shouldUnregister: true,
            defaultValues: { test: 'test' },
            resetOptions: { keepErrors: true },
          }),
        )

        const component = render(<input {...hook.result.current.register('test')} />)

        hook.result.current.control.stores.errors.set({ test: {} })

        component.unmount()
        hook.unmount()

        expect(hook.result.current.control.stores.errors.value.test).toBeDefined()
      })

      test('unsets dirty field when root keepDirty is undefined or false', async () => {
        const hook = renderHook(() =>
          useForm({
            shouldUnregister: true,
            defaultValues: { test: 'test' },
            resetOptions: { keepDirty: false },
          }),
        )

        const component = render(<input {...hook.result.current.register('test')} />)

        hook.result.current.control.stores.dirtyFields.set({ test: true })

        component.unmount()
        hook.unmount()

        expect(hook.result.current.control.stores.dirtyFields.value.test).toBeUndefined()
      })

      test('does not unset dirty field when root keepDirty is true', async () => {
        const hook = renderHook(() =>
          useForm({
            shouldUnregister: true,
            defaultValues: { test: 'test' },
            resetOptions: { keepDirty: true },
          }),
        )

        const component = render(<input {...hook.result.current.register('test')} />)

        hook.result.current.control.stores.dirtyFields.set({ test: true })

        component.unmount()
        hook.unmount()

        expect(hook.result.current.control.stores.dirtyFields.value.test).toBeDefined()
      })

      test('unsets touched field when root keepTouched is undefined or false', async () => {
        const hook = renderHook(() =>
          useForm({
            shouldUnregister: true,
            defaultValues: { test: 'test' },
            resetOptions: { keepTouched: false },
          }),
        )

        const component = render(<input {...hook.result.current.register('test')} />)

        hook.result.current.control.stores.touchedFields.set({ test: true })

        component.unmount()
        hook.unmount()

        expect(hook.result.current.control.stores.touchedFields.value.test).toBeUndefined()
      })

      test('does not unset touched field when root keepTouched is true', async () => {
        const hook = renderHook(() =>
          useForm({
            shouldUnregister: true,
            defaultValues: { test: 'test' },
            resetOptions: { keepTouched: true },
          }),
        )

        const component = render(<input {...hook.result.current.register('test')} />)

        hook.result.current.control.stores.touchedFields.set({ test: true })

        component.unmount()
        hook.unmount()

        expect(hook.result.current.control.stores.touchedFields.value.test).toBeDefined()
      })

      test('unsets all relevant store values and updates once per input unregistered', async () => {
        const hook = renderHook(() =>
          useForm({
            shouldUnregister: true,
            defaultValues: { test: 'test', test2: 'test2' },
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

        expect(fn).toHaveBeenCalledTimes(2)
      })
    })
  })
})
