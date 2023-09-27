import { fireEvent, waitFor } from '@testing-library/dom'
import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('register', () => {
    test('unmounts properly', () => {
      const formControl = new FormControl()

      formControl.register('test')

      expect(formControl.state.values.value).toEqual({ test: undefined })

      formControl.unmount()

      expect(formControl.state.values.value).toEqual({})
    })
  })

  test('field array is preserved when unmounting', () => {
    const formControl = new FormControl<{ test: string[] }>()

    formControl.register('test.0')
    formControl.register('test.1')
    formControl.register('test.2')

    expect(formControl.state.values.value).toEqual({ test: [undefined, undefined, undefined] })

    formControl.unmount()

    expect(formControl.state.values.value).toEqual({ test: [undefined, undefined, undefined] })
  })

  test('preserves errors when unmounting', async () => {
    const formControl = new FormControl<{ test: string }>()

    formControl.register('test', { required: true })

    await formControl.handleSubmit()()

    expect(formControl.state.errors.value.test).toBeDefined()

    formControl.unmount()

    expect(formControl.state.errors.value.test).toBeDefined()
  })

  test('unregisters errors when unregister invoked', async () => {
    const formControl = new FormControl<{ test: string }>()

    formControl.register('test', { required: true })

    await formControl.handleSubmit()()

    expect(formControl.state.errors.value.test).toBeDefined()

    formControl.unregister('test')

    expect(formControl.state.errors.value.test).toBeUndefined()
  })

  test('preserves touched fields', async () => {
    const formControl = new FormControl<{ test: string }>()

    const { registerElement } = formControl.register('test', { required: true })

    const input = document.createElement('input')

    registerElement(input)

    fireEvent.blur(input, { target: { value: 'test' } })

    expect(formControl.state.touchedFields.value.test).toBeDefined()
    expect(formControl.state.isDirty.value).toBeFalsy()

    formControl.unmount()

    expect(formControl.state.touchedFields.value.test).toBeDefined()
    expect(formControl.state.isDirty.value).toBeFalsy()
  })

  test('updates dirtyFields during unregister', async () => {
    const formControl = new FormControl<{ test: string }>()

    const { registerElement } = formControl.register('test', { required: true })

    const input = document.createElement('input')

    registerElement(input)

    fireEvent.input(input, { target: { value: 'test' } })

    expect(formControl.state.dirtyFields.value.test).toBeDefined()
    expect(formControl.state.isDirty.value).toBeTruthy()

    formControl.unmount()

    expect(formControl.state.dirtyFields.value.test).toBeDefined()
    expect(formControl.state.isDirty.value).toBeTruthy()
  })

  test('only validates inputs which are mounted even with shouldUnregister: false', async () => {
    type MyForm = {
      firstName: string
      lastName: string
    }

    const formControl = new FormControl<MyForm>()

    const firstName = formControl.register('firstName', { required: true, shouldUnregister: false })

    const firstNameInput = document.createElement('input')

    firstName.registerElement(firstNameInput)

    const lastName = formControl.register('lastName', { required: true, shouldUnregister: false })

    const lastNameInput = document.createElement('input')

    lastName.registerElement(lastNameInput)

    const form = document.createElement('form')

    const onInvalid = vi.fn()

    const handleSubmit = formControl.handleSubmit(undefined, onInvalid)

    form.addEventListener('submit', handleSubmit as any)

    fireEvent.submit(form)

    waitFor(() => expect(onInvalid).toHaveBeenCalledTimes(1))

    waitFor(() =>
      expect(formControl.state.errors.value).toEqual({
        firstName: { type: 'required', message: '', ref: firstNameInput },
        lastName: { type: 'required', message: '', ref: lastNameInput },
      }),
    )
  })
})
