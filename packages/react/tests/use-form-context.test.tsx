import { deepEqual } from '@forms.js/core/utils/deep-equal'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { describe, test, expect, vi } from 'vitest'

import { FormControlProvider } from '../src/form-provider'
import { useForm } from '../src/use-form'
import { useFormControlContext } from '../src/use-form-context'
import { useFormState } from '../src/use-form-state'

describe('FormControlProvider', () => {
  test('use-form props are provided via context', () => {
    const mockRegister = vi.fn()

    const Test = () => {
      const { formControl } = useFormControlContext()

      useEffect(() => {
        formControl.register('test')
      }, [formControl.register])

      return null
    }

    const App = () => {
      const { formControl } = useForm()

      formControl.register = mockRegister

      return (
        <FormControlProvider formControl={formControl}>
          <form>
            <Test />
          </form>
        </FormControlProvider>
      )
    }

    render(<App />)

    expect(mockRegister).toHaveBeenCalled()
  })

  test.todo('should work correctly with Controller, useWatch, useFormState.', async () => {})

  test('should not throw type error', () => {
    type FormValues = {
      firstName: string
    }

    type Context = {
      someValue: boolean
    }

    function App() {
      const methods = useForm<FormValues, Context>()
      const { handleSubmit, register } = methods

      return (
        <div>
          <FormControlProvider {...methods}>
            <form onSubmit={handleSubmit(() => {})}>
              <input {...register('firstName')} placeholder="First Name" />
              <input type="submit" />
            </form>
          </FormControlProvider>
        </div>
      )
    }

    expect(() => render(<App />)).not.toThrowError()
  })

  test('should be able to access defaultValues within formState', () => {
    type FormValues = {
      firstName: string
      lastName: string
    }

    const defaultValues = {
      firstName: 'a',
      lastName: 'b',
    }

    const Test1 = () => {
      const methods = useFormState()

      return <p>{deepEqual(methods.defaultValues, defaultValues) ? 'context-yes' : 'context-no'}</p>
    }

    const Test = () => {
      const { formControl } = useFormControlContext()

      return <p>{deepEqual(formControl.state.defaultValues.value, defaultValues) ? 'yes' : 'no'}</p>
    }

    const Component = () => {
      const { formControl } = useForm<FormValues>({ defaultValues })

      return (
        <FormControlProvider formControl={formControl}>
          <Test />
          <Test1 />
          <button
            onClick={() => {
              formControl.reset({ firstName: 'c', lastName: 'd' })
            }}
          >
            reset
          </button>
          <p>{JSON.stringify(defaultValues)}</p>
        </FormControlProvider>
      )
    }

    render(<Component />)

    expect(screen.getByText('yes')).toBeTruthy()
    expect(screen.getByText('context-yes')).toBeTruthy()

    screen.getByText(JSON.stringify(defaultValues))

    fireEvent.click(screen.getByRole('button'))

    waitFor(() => {
      expect(screen.getByText('yes')).toBeFalsy()
      expect(screen.getByText('context-yes')).toBeFalsy()

      screen.getByText(
        JSON.stringify({
          firstName: 'c',
          lastName: 'd',
        }),
      )
    })
  })

  test('should report errors correctly', async () => {
    const Child = () => {
      const {
        formState: { errors },
        formControl,
      } = useFormControlContext<{
        test: string
      }>()

      return (
        <form onSubmit={formControl.handleSubmitReact(() => {})}>
          <input {...formControl.registerReact('test', { required: 'This is required' })} />
          <p>{errors.test?.message}</p>
          <button>submit</button>
        </form>
      )
    }

    const App = () => {
      const methods = useForm()

      return (
        <FormControlProvider {...methods}>
          <Child />
        </FormControlProvider>
      )
    }

    render(<App />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => screen.getByText('This is required'))
  })
})
