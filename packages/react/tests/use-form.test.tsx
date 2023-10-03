import {
  act,
  renderHook,
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { useState, useEffect } from 'react'
import { describe, test, expect } from 'vitest'

import { useForm } from '../src/use-form'

describe('useForm', () => {
  describe('when component unMount', () => {
    test('should call unSubscribe', () => {
      const { result, unmount } = renderHook(() => useForm<{ test: string }>())

      result.current.register('test')
      unmount()

      expect(result.current.getValues()).toEqual({})
    })

    test('should remain array field values when inputs gets unmounted', () => {
      const { result, unmount } = renderHook(() => useForm<{ test: string[] }>())

      result.current.register('test.0')
      result.current.register('test.1')
      result.current.register('test.2')

      unmount()

      expect(result.current.getValues()).toEqual({
        test: [undefined, undefined, undefined],
      })
    })

    test('should not unregister errors when unmounted', async () => {
      const { result, unmount } = renderHook(() =>
        useForm<{
          test: string
        }>(),
      )

      result.current.formState.errors
      result.current.register('test', { required: true })

      await act(async () => {
        const event = new Event('')
        await result.current.formControl.handleSubmit(() => {})(event)
      })

      expect(result.current.formState.errors.test).toBeDefined()

      unmount()

      expect(result.current.formState.errors.test).toBeDefined()
    })

    test('should only unregister errors when unregister method invoked', async () => {
      const { result } = renderHook(() =>
        useForm<{
          test: string
        }>(),
      )

      result.current.formState.errors
      result.current.register('test', { required: true })

      await act(async () => {
        const event = new Event('')
        await result.current.formControl.handleSubmit(() => {})(event)
      })

      expect(result.current.formState.errors.test).toBeDefined()

      await act(async () => {
        result.current.unregister('test')
      })

      expect(result.current.formState.errors.test).not.toBeDefined()
    })

    test('should not unregister touched', () => {
      let formState: any
      const Component = () => {
        const { register, formState: tempFormState } = useForm<{
          test: string
        }>()
        formState = tempFormState

        formState.touchedFields

        return (
          <div>
            <input {...register('test', { required: true })} />
          </div>
        )
      }
      const { unmount } = render(<Component />)

      fireEvent.blur(screen.getByRole('textbox'), {
        target: {
          value: 'test',
        },
      })

      expect(formState.touchedFields.test).toBeDefined()
      expect(formState.isDirty).toBeFalsy()

      unmount()

      expect(formState.touchedFields.test).toBeDefined()
      expect(formState.isDirty).toBeFalsy()
    })

    test('should update dirtyFields during unregister', () => {
      let formState: any

      const Component = () => {
        const { register, formState: tempFormState } = useForm<{
          test: string
        }>()
        formState = tempFormState

        formState.isDirty
        formState.dirtyFields

        return <input {...register('test', { required: true })} />
      }
      const { unmount } = render(<Component />)

      fireEvent.input(screen.getByRole('textbox'), {
        target: {
          value: 'test',
        },
      })

      expect(formState.dirtyFields.test).toBeDefined()
      expect(formState.isDirty).toBeTruthy()

      unmount()

      expect(formState.dirtyFields.test).toBeDefined()
      expect(formState.isDirty).toBeTruthy()
    })

    test('should only validate input which are mounted even with shouldUnregister: false', async () => {
      const Component = () => {
        const [show, setShow] = useState(true)
        const {
          handleSubmit,
          register,
          formState: { errors },
        } = useForm<{
          firstName: string
          lastName: string
        }>()
        return (
          <form onSubmit={handleSubmit(() => {})}>
            {show && <input {...register('firstName', { required: true })} />}
            {errors.firstName && <p>First name is required.</p>}
            <input {...register('lastName', { required: true })} />
            {errors.lastName && <p>Last name is required.</p>}
            <button type={'button'} onClick={() => setShow(!show)}>
              toggle
            </button>
            <button type={'submit'}>submit</button>
          </form>
        )
      }
      render(<Component />)
      fireEvent.click(screen.getByRole('button', { name: 'submit' }))
      expect(await screen.findByText('First name is required.')).toBeTruthy()
      expect(screen.getByText('Last name is required.')).toBeTruthy()
      fireEvent.click(screen.getByRole('button', { name: 'toggle' }))
      fireEvent.click(screen.getByRole('button', { name: 'submit' }))
      expect(screen.getByText('Last name is required.')).toBeTruthy()
      await waitForElementToBeRemoved(screen.queryByText('First name is required.'))
    })
  })

  test('should not register or shallow defaultValues into submission data', () => {
    let data = {}

    const App = () => {
      const { handleSubmit } = useForm({
        defaultValues: {
          test: 'test',
        },
      })

      return (
        <button
          onClick={handleSubmit((d) => {
            data = d
          })}
        >
          submit
        </button>
      )
    }

    render(<App />)

    fireEvent.click(screen.getByRole('button'))

    expect(data).toEqual({})
  })

  test('should only unregister inputs when all checkboxes are unmounted', async () => {
    let result: Record<string, string> | undefined = undefined

    const Component = () => {
      const { register, handleSubmit } = useForm({ shouldUnregister: true })
      const [radio1, setRadio1] = useState(true)
      const [radio2, setRadio2] = useState(true)

      return (
        <form
          onSubmit={handleSubmit((data) => {
            result = data
          })}
        >
          {radio1 && <input {...register('test')} type={'radio'} value={'1'} />}
          {radio2 && <input {...register('test')} type={'radio'} value={'2'} />}
          <button type="button" onClick={() => setRadio1(!radio1)}>
            setRadio1
          </button>
          <button type="button" onClick={() => setRadio2(!radio2)}>
            setRadio2
          </button>
          <button>Submit</button>
        </form>
      )
    }

    render(<Component />)

    fireEvent.click(screen.getByRole('button', { name: 'setRadio1' }))

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(result).toEqual({ test: null }))

    fireEvent.click(screen.getByRole('button', { name: 'setRadio2' }))

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(result).toEqual({}))
  })

  describe('when errors changes', () => {
    test('should display the latest error message', async () => {
      const Form = () => {
        const {
          register,
          setError,
          formState: { errors },
        } = useForm<{
          test: string
        }>()

        useEffect(() => {
          setError('test', {
            type: 'data',
            message: 'data',
          })
        }, [setError])

        return (
          <div>
            <input
              {...register('test', {
                maxLength: {
                  message: 'max',
                  value: 3,
                },
              })}
              placeholder="test"
              type="text"
            />
            <span role="alert">{errors.test && errors.test.message}</span>
          </div>
        )
      }

      render(<Form />)

      const span = screen.getByRole('alert')

      await waitFor(() => expect(span.textContent).toBe('data'))

      fireEvent.input(screen.getByRole('textbox'), {
        target: {
          value: 'test',
        },
      })

      await waitFor(() => expect(span.textContent).toBe('data'))
    })
  })
})
