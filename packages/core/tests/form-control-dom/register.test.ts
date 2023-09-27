import { fireEvent, waitFor } from '@testing-library/dom'
import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { RegisterOptions } from '../../src/types/register'

function createComponent(options?: {
  resolver?: any
  mode?: 'onBlur' | 'onSubmit' | 'onChange'
  rules?: RegisterOptions<{ test: string }, 'test'>
  onSubmit?: () => void
  onError?: () => void
}) {
  const rules = options?.rules ?? { required: true }

  const input = document.createElement('input')
  input.type = 'text'

  const button = document.createElement('button')

  const form = document.createElement('form')

  document.body.appendChild(form)
  form.appendChild(input)
  form.appendChild(button)

  const formControl = new FormControl<{ test: string }>(options)

  const { registerElement } = formControl.register('test', options?.resolver ? {} : rules)

  registerElement(input)

  const handleSubmit = formControl.handleSubmit(options?.onSubmit, options?.onError)

  button.addEventListener('click', handleSubmit)

  return { input, button, formControl, form }
}

describe('FormControl', () => {
  describe('register', () => {
    describe('unmount', () => {
      test('unmounts properly', () => {
        const formControl = new FormControl()

        formControl.register('test')

        expect(formControl.state.values.value).toEqual({ test: undefined })

        formControl.unmount()

        expect(formControl.state.values.value).toEqual({})
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

        const firstName = formControl.register('firstName', {
          required: true,
          shouldUnregister: false,
        })

        const firstNameInput = document.createElement('input')

        firstName.registerElement(firstNameInput)

        const lastName = formControl.register('lastName', {
          required: true,
          shouldUnregister: false,
        })

        const lastNameInput = document.createElement('input')

        lastName.registerElement(lastNameInput)

        const form = document.createElement('form')

        const onInvalid = vi.fn()

        const handleSubmit = formControl.handleSubmit(undefined, onInvalid)

        form.addEventListener('submit', handleSubmit)

        fireEvent.submit(form)

        await waitFor(() => expect(onInvalid).toHaveBeenCalledTimes(1))

        await waitFor(() =>
          expect(formControl.state.errors.value).toEqual({
            firstName: { type: 'required', message: '', ref: firstNameInput },
            lastName: { type: 'required', message: '', ref: lastNameInput },
          }),
        )
      })
    })

    describe('shouldUnregister: true', () => {
      test.todo('field array', () => {})

      test.todo('should remove and unregister fields when unmounting', () => {})

      test.todo('should not mutate defaultValues', () => {})

      test('should not register or shallow defaultValues into submission data', async () => {
        const formControl = new FormControl({ shouldUnregister: true })

        const button = document.createElement('button')

        const onValid = vi.fn()

        button.addEventListener('click', formControl.handleSubmit(onValid))

        fireEvent.click(button)

        await waitFor(() => expect(onValid).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(onValid).toHaveBeenCalledWith({}, expect.anything()))
      })

      test('keeps validation during unmount', async () => {
        type MyForm = {
          firstName: string
          moreDetail: boolean
        }

        const formControl = new FormControl<MyForm>({ shouldUnregister: true })

        const onValid = vi.fn()
        const onInvalid = vi.fn()

        const form = document.createElement('form')

        form.addEventListener('submit', formControl.handleSubmit(onValid, onInvalid))

        const firstName = formControl.register('firstName', { maxLength: 3 })
        const moreDetail = formControl.register('moreDetail')

        const firstNameInput = document.createElement('input')
        firstNameInput.placeholder = 'firstName'

        const moreDetailInput = document.createElement('input')
        moreDetailInput.type = 'checkbox'
        moreDetailInput.placeholder = 'checkbox'

        form.appendChild(firstNameInput)
        form.appendChild(moreDetailInput)
        document.body.appendChild(form)

        firstName.registerElement(firstNameInput)
        moreDetail.registerElement(moreDetailInput)

        fireEvent.change(firstNameInput, { target: { value: 'testtesttest' } })
        fireEvent.submit(form)

        await waitFor(() => expect(onValid).toHaveBeenCalledTimes(0))
        await waitFor(() => expect(onInvalid).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(formControl.state.submitCount.value).toEqual(1))
        await waitFor(() =>
          expect(formControl.state.errors.value).toEqual({
            firstName: { type: 'maxLength', message: '', ref: firstNameInput },
          }),
        )

        fireEvent.change(firstNameInput, { target: { value: 'a' } })
        fireEvent.submit(form)

        await waitFor(() => expect(onValid).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(onInvalid).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(formControl.state.submitCount.value).toEqual(2))
        await waitFor(() => expect(formControl.state.errors.value).toEqual({}))
      })

      test('only unregisters inputs when all checkboxes are unmounted', async () => {
        const formControl = new FormControl({ shouldUnregister: true })

        const radio1 = formControl.register('test', { required: true })
        const radio2 = formControl.register('test', { required: true })

        const radio1Input = document.createElement('input')
        radio1Input.type = 'radio'
        radio1Input.value = '1'

        const radio2Input = document.createElement('input')
        radio2Input.type = 'radio'
        radio2Input.value = '2'

        const form = document.createElement('form')

        document.body.appendChild(form)
        form.appendChild(radio1Input)
        form.appendChild(radio2Input)

        radio1.registerElement(radio1Input)
        radio2.registerElement(radio2Input)

        const onValid = vi.fn()
        const onInvalid = vi.fn()

        const handleSubmit = formControl.handleSubmit(onValid, onInvalid)

        form.addEventListener('submit', handleSubmit)

        form.removeChild(radio1Input)
        radio1.unregisterElement()

        formControl.render()
        fireEvent.submit(form)

        await waitFor(() =>
          expect(onValid).toHaveBeenLastCalledWith({ test: null }, expect.anything()),
        )

        form.removeChild(radio2Input)
        radio2.unregisterElement()

        fireEvent.submit(form)
        formControl.render()

        await waitFor(() => expect(onValid).toHaveBeenLastCalledWith({}, expect.anything()))
      })
    })

    describe('when errors change', () => {
      test('should display the latest error message', async () => {
        const formControl = new FormControl<{ test: string }>()

        const input = document.createElement('input')
        input.placeholder = 'test'
        input.type = 'text'

        const { registerElement } = formControl.register('test', {
          maxLength: { message: 'max', value: 3 },
        })
        registerElement(input)

        formControl.setError('test', { type: 'data', message: 'data' })

        const originalError = { ...formControl.state.errors.value.test }

        fireEvent.input(input, { target: { value: 'test' } })

        await waitFor(() =>
          expect(formControl.state.errors.value.test).toStrictEqual(originalError),
        )
      })
    })

    describe('handle change', () => {
      describe('onSubmit mode', () => {
        test('should not contain errors for valid values', async () => {
          const onSubmit = vi.fn()

          const { input, button } = createComponent({ onSubmit })

          fireEvent.input(input, { target: { value: 'aponia' } })

          fireEvent.click(button)

          await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        })

        test('should not contain errors if invalid target for input', async () => {
          const onSubmit = vi.fn()

          const { input, button } = createComponent({ onSubmit })

          fireEvent.input(input, { target: { value: 'aponia' } })

          fireEvent.input(button, { target: { value: '' } })

          fireEvent.click(button)

          await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        })

        test('should contain error for invalid value with reValidateMode: onChange', async () => {
          const onSubmit = vi.fn()
          const onError = vi.fn()

          const { input, button } = createComponent({
            onError,
            onSubmit,
            mode: 'onChange',
          })

          fireEvent.input(input, { target: { value: 'aponia' } })

          fireEvent.click(button)

          await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))

          fireEvent.input(input, { target: { value: '' } })

          fireEvent.click(button)

          await waitFor(() => expect(onError).toHaveBeenCalledTimes(1))
        })

        test.todo('no re-render if current error is the same as previous error', async () => {})

        test('set touchedFields', async () => {
          const onSubmit = vi.fn()

          const { input, button, formControl } = createComponent({ onSubmit, rules: {} })

          fireEvent.click(button)

          await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))

          fireEvent.blur(input, { target: { value: 'test' } })

          await waitFor(() => expect(formControl.state.touchedFields.value).toEqual({ test: true }))
        })

        /**
         * @see https://github.com/react-hook-form/react-hook-form/issues/2153
         */
        test('correct behavior when reValidateMode is onBlur', async () => {
          const formControl = new FormControl<{ test: string }>({
            revalidateMode: 'onBlur',
          })

          const input = document.createElement('input')
          input.type = 'text'

          const form = document.createElement('form')

          document.body.appendChild(form)
          form.appendChild(input)

          const { registerElement } = formControl.register('test', { required: true })
          registerElement(input)

          const onValid = vi.fn()
          const onInvalid = vi.fn()

          const handleSubmit = formControl.handleSubmit(onValid, onInvalid)

          form.addEventListener('submit', handleSubmit)

          fireEvent.input(input, { target: { value: 'test' } })
          fireEvent.submit(form)

          await waitFor(() => expect(onValid).toHaveBeenCalledTimes(1))

          fireEvent.input(input, { target: { value: '' } })

          await waitFor(() => expect(formControl.state.errors.value).toEqual({}))

          fireEvent.blur(input)

          await waitFor(() =>
            expect(formControl.state.errors.value).toEqual({
              test: { type: 'required', message: '', ref: input },
            }),
          )
        })
      })
    })

    describe('onChange', () => {
      test('display error with onChange', async () => {
        const formControl = new FormControl<{ test: string }>({
          mode: 'onChange',
        })

        const input = document.createElement('input')
        input.type = 'text'

        const { registerElement } = formControl.register('test', { required: true })
        registerElement(input)

        fireEvent.change(input, { target: { value: '' } })

        await waitFor(() =>
          expect(formControl.state.errors.value).toEqual({
            test: { type: 'required', message: '', ref: input },
          }),
        )
      })

      test('display error with onSubmit', async () => {
        const { input, button, formControl } = createComponent({ mode: 'onSubmit' })

        fireEvent.click(button)

        await waitFor(() =>
          expect(formControl.state.errors.value).toEqual({
            test: {
              type: 'required',
              message: '',
              ref: input,
            },
          }),
        )
      })

      test('should not display error with onBlur', async () => {
        const { input, formControl } = createComponent({ mode: 'onSubmit' })

        fireEvent.blur(input, { target: { value: '' } })

        await waitFor(() => expect(formControl.state.errors.value).toEqual({}))
      })
    })

    describe('onBlur', () => {
      test.only('should display error with onBlur', async () => {
        const { input, formControl } = createComponent({ mode: 'onBlur' })

        fireEvent.blur(input, { target: { value: '' } })

        await waitFor(() =>
          expect(formControl.state.errors.value).toEqual({
            test: {
              type: 'required',
              message: '',
              ref: input,
            },
          }),
        )
      })
    })
  })
})
