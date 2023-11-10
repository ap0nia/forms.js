/* eslint-disable */

import {
  act,
  renderHook,
  act as actComponent,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import React, { useState } from 'react'

describe('useForm', () => {
  describe('when shouldUnregister set to true', () => {
    describe('with useFieldArray', () => {
      type FormValues = {
        test: string
        test1: string
        test2: {
          value: string
        }[]
      }

      const Child = ({
        control,
        register,
      }: {
        control: Control<FormValues>
        register: UseFormRegister<FormValues>
      }) => {
        const { fields } = useFieldArray({
          control,
          name: 'test2',
          shouldUnregister: true,
        })

        return (
          <>
            {fields.map((field, i) => (
              <input key={field.id} {...register(`test2.${i}.value` as const)} />
            ))}
          </>
        )
      }
    })
  })

  describe('handleChangeRef', () => {
    const Component = ({
      resolver,
      mode,
      rules = { required: 'required' },
      onSubmit = () => {},
    }: {
      resolver?: any
      mode?: 'onBlur' | 'onSubmit' | 'onChange'
      rules?: RegisterOptions<{ test: string }, 'test'>
      onSubmit?: () => void
    }) => {
      const internationalMethods = useForm<{ test: string }>({
        resolver,
        mode,
      })
      const {
        register,
        handleSubmit,
        formState: { errors, isValid, isDirty },
      } = internationalMethods
      methods = internationalMethods

      return (
        <div>
          <input type="text" {...register('test', resolver ? {} : rules)} />
          <span role="alert">{errors?.test?.message && errors.test.message}</span>
          <button onClick={handleSubmit(onSubmit)}>button</button>
          <p>{isValid ? 'valid' : 'invalid'}</p>
          <p>{isDirty ? 'dirty' : 'pristine'}</p>
        </div>
      )
    }
    let methods: UseFormReturn<{ test: string }>

    describe('onSubmit mode', () => {
      it('should not contain error if value is valid', async () => {
        const onSubmit = jest.fn()

        render(<Component onSubmit={onSubmit} />)

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test', value: 'test' },
        })

        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => expect(onSubmit).toHaveBeenCalled())

        const alert = await screen.findByRole('alert')
        expect(alert.textContent).toBe('')

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test', value: 'test' },
        })

        expect(alert.textContent).toBe('')
      })

      it('should not contain error if name is invalid', async () => {
        const onSubmit = jest.fn()

        render(<Component onSubmit={onSubmit} />)

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test', value: 'test' },
        })

        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => expect(onSubmit).toHaveBeenCalled())

        const alert = await screen.findByRole('alert')
        expect(alert.textContent).toBe('')

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'wrongName', value: '' },
        })

        expect(alert.textContent).toBe('')
      })

      it('should contain error if value is invalid with revalidateMode is onChange', async () => {
        const onSubmit = jest.fn()

        render(<Component onSubmit={onSubmit} />)

        const input = screen.getByRole('textbox')

        fireEvent.input(input, { target: { name: 'test', value: 'test' } })

        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => expect(onSubmit).toHaveBeenCalled())

        expect(screen.getByRole('alert').textContent).toBe('')

        fireEvent.input(input, { target: { name: 'test', value: '' } })

        await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('required'))
      })

      it('should not call reRender method if the current error is the same as the previous error', async () => {
        render(<Component />)

        const input = screen.getByRole('textbox')

        fireEvent.input(input, { target: { name: 'test', value: '' } })

        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('required'))

        fireEvent.input(input, { target: { name: 'test', value: '' } })

        expect(screen.getByRole('alert').textContent).toBe('required')
      })

      it('should set name to formState.touchedFields when formState.touchedFields is defined', async () => {
        const onSubmit = jest.fn()

        render(<Component onSubmit={onSubmit} rules={{}} />)

        methods.formState.touchedFields

        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => expect(onSubmit).toHaveBeenCalled())

        fireEvent.blur(screen.getByRole('textbox'), {
          target: { name: 'test', value: 'test' },
        })

        await waitFor(() =>
          expect(methods.formState.touchedFields).toEqual({
            test: true,
          }),
        )
        expect(screen.getByRole('alert').textContent).toBe('')
      })

      // check https://github.com/react-hook-form/react-hook-form/issues/2153
      it('should perform correct behavior when reValidateMode is onBlur', async () => {
        const onSubmit = jest.fn()

        const Component = () => {
          const {
            register,
            handleSubmit,
            formState: { errors },
          } = useForm<{
            test: string
          }>({
            reValidateMode: 'onBlur',
          })
          return (
            <form onSubmit={handleSubmit(onSubmit)}>
              <input type="text" {...register('test', { required: true })} />
              {errors.test && <span role="alert">required</span>}
              <button>submit</button>
            </form>
          )
        }

        render(<Component />)

        fireEvent.input(screen.getByRole('textbox'), {
          target: {
            value: 'test',
          },
        })

        fireEvent.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => expect(onSubmit).toHaveBeenCalled())

        fireEvent.input(screen.getByRole('textbox'), {
          target: { value: '' },
        })

        expect(screen.queryByRole('alert')).not.toBeInTheDocument()

        fireEvent.blur(screen.getByRole('textbox'))

        expect(await screen.findByRole('alert')).toBeVisible()
      })
    })

    describe('onChange', () => {
      it('should display error with onChange', async () => {
        render(<Component mode="onChange" />)

        fireEvent.change(screen.getByRole('textbox'), {
          target: {
            value: 'test',
          },
        })

        await waitFor(() => screen.getByText('valid'))

        fireEvent.change(screen.getByRole('textbox'), {
          target: {
            value: '',
          },
        })

        await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('required'))
      })

      it('should display error with onSubmit', async () => {
        render(<Component mode="onChange" />)

        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('required'))
      })

      it('should not display error with onBlur', async () => {
        render(<Component mode="onChange" />)

        fireEvent.blur(screen.getByRole('textbox'), {
          target: {
            value: '',
          },
        })

        expect(screen.getByRole('alert').textContent).toBe('')
      })
    })

    describe('onBlur', () => {
      it('should display error with onBlur', async () => {
        render(<Component mode="onBlur" />)

        fireEvent.blur(screen.getByRole('textbox'), {
          target: {
            value: '',
          },
        })

        await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('required'))
      })

      it('should display error with onSubmit', async () => {
        render(<Component mode="onBlur" />)

        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('required'))
      })

      it('should not display error with onChange', async () => {
        render(<Component mode="onBlur" />)

        fireEvent.input(screen.getByRole('textbox'), {
          target: {
            value: '',
          },
        })

        expect(screen.getByRole('alert').textContent).toBe('')
      })
    })

    describe('with resolver', () => {
      it('should contain error if value is invalid with resolver', async () => {
        const resolver = jest.fn(async (data: any) => {
          if (data.test) {
            return { values: data, errors: {} }
          }
          return {
            values: data,
            errors: {
              test: {
                message: 'resolver error',
              },
            },
          }
        })

        render(<Component resolver={resolver} mode="onChange" />)

        methods.formState.isValid

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test', value: 'test' },
        })
        expect(await screen.findByText('dirty')).toBeVisible()
        expect(resolver).toHaveBeenCalled()

        expect(screen.getByRole('alert').textContent).toBe('')
        expect(methods.formState.isValid).toBeTruthy()

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test', value: '' },
        })

        await waitFor(() => {
          expect(screen.getByRole('alert')).toHaveTextContent('resolver error')
        })
        expect(resolver).toHaveBeenCalled()
        expect(methods.formState.isValid).toBeFalsy()
      })

      it('with sync resolver it should contain error if value is invalid with resolver', async () => {
        const resolver = jest.fn((data: any) => {
          if (data.test) {
            return { values: data, errors: {} }
          }
          return {
            values: data,
            errors: {
              test: {
                message: 'resolver error',
              },
            },
          }
        })

        render(<Component resolver={resolver} mode="onChange" />)

        methods.formState.isValid

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test', value: 'test' },
        })

        await waitFor(() => expect(methods.formState.isValid).toBe(true))
        expect(screen.getByRole('alert').textContent).toBe('')

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test', value: '' },
        })

        expect(await screen.findByText('invalid')).toBeVisible()
        expect(methods.formState.isValid).toBe(false)
        expect(screen.getByRole('alert')).toHaveTextContent('resolver error')
        expect(resolver).toHaveBeenCalled()
      })

      it('should make isValid change to false if it contain error that is not related name with onChange mode', async () => {
        const resolver = jest.fn(async (data: any) => {
          if (data.test) {
            return { values: data, errors: {} }
          }
          return {
            values: data,
            errors: {
              notRelatedName: {
                message: 'resolver error',
              },
            },
          }
        })

        render(<Component resolver={resolver} mode="onChange" />)

        methods.formState.isValid

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test', value: 'test' },
        })

        await waitFor(() => expect(methods.formState.isValid).toBeTruthy())
        expect(screen.getByRole('alert').textContent).toBe('')

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test', value: '' },
        })

        await waitFor(() => expect(methods.formState.isValid).toBeFalsy())
        expect(resolver).toHaveBeenCalled()
        expect(screen.getByRole('alert').textContent).toBe('')
      })

      it("should call the resolver with the field being validated when an input's value change", async () => {
        const resolver = jest.fn((values: any) => ({ values, errors: {} }))
        const onSubmit = jest.fn()

        render(<Component resolver={resolver} onSubmit={onSubmit} mode="onChange" />)

        expect(await screen.findByText('valid')).toBeVisible()

        const input = screen.getByRole('textbox')

        expect(resolver).toHaveBeenCalledWith(
          {
            test: '',
          },
          undefined,
          {
            criteriaMode: undefined,
            fields: {
              test: {
                mount: true,
                name: 'test',
                ref: input,
              },
            },
            names: ['test'],
            shouldUseNativeValidation: undefined,
          },
        )

        resolver.mockClear()

        fireEvent.input(input, {
          target: { name: 'test', value: 'test' },
        })

        expect(await screen.findByText('dirty')).toBeVisible()

        expect(resolver).toHaveBeenCalledWith(
          {
            test: 'test',
          },
          undefined,
          {
            criteriaMode: undefined,
            fields: {
              test: {
                mount: true,
                name: 'test',
                ref: input,
              },
            },
            names: ['test'],
            shouldUseNativeValidation: undefined,
          },
        )

        resolver.mockClear()

        fireEvent.click(screen.getByText(/button/i))

        await waitFor(() => expect(onSubmit).toHaveBeenCalled())

        expect(resolver).toHaveBeenCalledWith(
          {
            test: 'test',
          },
          undefined,
          {
            criteriaMode: undefined,
            fields: {
              test: {
                mount: true,
                name: 'test',
                ref: input,
              },
            },
            names: ['test'],
            shouldUseNativeValidation: undefined,
          },
        )
      })
    })
  })

  describe('with schema validation', () => {
    it('should have formState.isValid equals true with defined default values after executing resolver', async () => {
      const Toggle = () => {
        const [toggle, setToggle] = React.useState(false)

        const { register, formState } = useForm({
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
        })

        return (
          <>
            <button onClick={() => setToggle(!toggle)}>Toggle</button>
            {toggle && <input id="test" {...register('test')} />}
            <button disabled={!formState.isValid}>Submit</button>
          </>
        )
      }

      render(<Toggle />)

      const toggle = () => fireEvent.click(screen.getByText('Toggle'))

      toggle()

      await waitFor(() => expect(screen.getByText('Submit')).toBeEnabled())

      toggle()
      toggle()

      expect(screen.getByText('Submit')).toBeEnabled()
    })
  })

  describe('control', () => {
    it('does not change across re-renders', () => {
      let control

      const Component = () => {
        const form = useForm<{
          test: string
        }>()

        control = form.control

        return (
          <>
            <input type="text" {...form.register('test')} />
          </>
        )
      }

      const { rerender } = render(<Component />)

      const firstRenderControl = control

      rerender(<Component />)

      const secondRenderControl = control

      expect(Object.is(firstRenderControl, secondRenderControl)).toBe(true)
    })
  })

  describe('when input is not registered', () => {
    it('trigger should not throw warn', async () => {
      const { result } = renderHook(() =>
        useForm<{
          test: string
        }>(),
      )

      await act(async () => expect(await result.current.trigger('test')).toBeTruthy())
    })
  })

  it('should unsubscribe to all subject when hook unmounts', () => {
    let tempControl: any

    const App = () => {
      const { control } = useForm()
      tempControl = control

      return null
    }

    const { unmount } = render(<App />)

    expect(tempControl._subjects.state.observers.length).toBeTruthy()

    unmount()

    expect(tempControl._subjects.state.observers.length).toBeFalsy()
  })

  it('should update isValidating to true when other validation still running', async () => {
    jest.useFakeTimers()

    function App() {
      const [stateValidation, setStateValidation] = React.useState(false)
      const {
        register,
        formState: { isValidating },
      } = useForm({ mode: 'all' })

      return (
        <div>
          <p>isValidating: {String(isValidating)}</p>
          <p>stateValidation: {String(stateValidation)}</p>
          <form>
            <input
              {...register('lastName', {
                required: true,
                validate: () => {
                  setStateValidation(true)
                  return new Promise((resolve) => {
                    setTimeout(() => {
                      setStateValidation(false)
                      resolve(true)
                    }, 5000)
                  })
                },
              })}
              placeholder="async"
            />

            <input {...register('firstName', { required: true })} placeholder="required" />
          </form>
        </div>
      )
    }

    render(<App />)

    fireEvent.change(screen.getByPlaceholderText('async'), {
      target: { value: 'test' },
    })
    fireEvent.change(screen.getByPlaceholderText('required'), {
      target: { value: 'test' },
    })

    screen.getByText('isValidating: true')
    screen.getByText('stateValidation: true')

    await actComponent(async () => {
      jest.runAllTimers()
    })

    screen.getByText('isValidating: false')
    screen.getByText('stateValidation: false')
  })

  it('should update defaultValues async', async () => {
    const App = () => {
      const {
        register,
        formState: { isLoading },
      } = useForm<{
        test: string
      }>({
        defaultValues: async () => {
          await sleep(100)

          return {
            test: 'test',
          }
        },
      })

      return (
        <form>
          <input {...register('test')} />
          <p>{isLoading ? 'loading...' : 'done'}</p>
        </form>
      )
    }

    render(<App />)

    await waitFor(() => {
      screen.getByText('loading...')
    })

    await waitFor(() => {
      expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual('test')
    })

    await waitFor(() => {
      screen.getByText('done')
    })
  })

  it('should update async default values for controlled components', async () => {
    const App = () => {
      const { control } = useForm<{
        test: string
      }>({
        defaultValues: async () => {
          await sleep(100)

          return {
            test: 'test',
          }
        },
      })

      return (
        <form>
          <Controller
            control={control}
            render={({ field }) => <input {...field} />}
            defaultValue=""
            name={'test'}
          />
        </form>
      )
    }

    render(<App />)

    await waitFor(() => {
      expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual('test')
    })
  })

  it('should update async form values', async () => {
    type FormValues = {
      test: string
    }

    function Loader() {
      const [values, setValues] = React.useState<FormValues>({
        test: '',
      })

      const loadData = React.useCallback(async () => {
        await sleep(100)

        setValues({
          test: 'test',
        })
      }, [])

      React.useEffect(() => {
        loadData()
      }, [loadData])

      return <App values={values} />
    }

    const App = ({ values }: { values: FormValues }) => {
      const { register } = useForm({
        values,
      })

      return (
        <form>
          <input {...register('test')} />
        </form>
      )
    }

    render(<Loader />)

    await waitFor(() => {
      expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual('test')
    })
  })

  it('should only update async form values which are not interacted', async () => {
    type FormValues = {
      test: string
      test1: string
    }

    function Loader() {
      const [values, setValues] = React.useState<FormValues>({
        test: '',
        test1: '',
      })

      const loadData = React.useCallback(async () => {
        await sleep(100)

        setValues({
          test: 'test',
          test1: 'data',
        })
      }, [])

      React.useEffect(() => {
        loadData()
      }, [loadData])

      return <App values={values} />
    }

    const App = ({ values }: { values: FormValues }) => {
      const { register } = useForm({
        values,
        resetOptions: {
          keepDirtyValues: true,
        },
      })

      return (
        <form>
          <input {...register('test')} />
          <input {...register('test1')} />
        </form>
      )
    }

    render(<Loader />)

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: {
        value: 'test1',
      },
    })

    await waitFor(() => {
      expect((screen.getAllByRole('textbox')[0] as HTMLInputElement).value).toEqual('test1')
    })

    await waitFor(() => {
      expect((screen.getAllByRole('textbox')[1] as HTMLInputElement).value).toEqual('data')
    })
  })

  it('should not update isLoading when literal defaultValues are provided', async () => {
    const { result } = renderHook(() => useForm({ defaultValues: { test: 'default' } }))

    expect(result.current.formState.isLoading).toBe(false)
  })

  it('should update isValidating to true when using with resolver', async () => {
    jest.useFakeTimers()

    function App() {
      const {
        register,
        formState: { isValidating },
      } = useForm<{
        firstName: string
        lastName: string
      }>({
        mode: 'all',
        defaultValues: {
          lastName: '',
          firstName: '',
        },
        resolver: async () => {
          await sleep(2000)

          return {
            errors: {},
            values: {},
          }
        },
      })

      return (
        <div>
          <p>isValidating: {String(isValidating)}</p>
          <input {...register('lastName')} placeholder="async" />
          <input {...register('firstName')} placeholder="required" />
        </div>
      )
    }

    render(<App />)

    fireEvent.change(screen.getByPlaceholderText('async'), {
      target: { value: 'test' },
    })
    fireEvent.change(screen.getByPlaceholderText('async'), {
      target: { value: 'test1' },
    })
    fireEvent.change(screen.getByPlaceholderText('required'), {
      target: { value: 'test2' },
    })
    fireEvent.change(screen.getByPlaceholderText('required'), {
      target: { value: 'test3' },
    })

    screen.getByText('isValidating: true')

    await actComponent(async () => {
      jest.runAllTimers()
    })

    screen.getByText('isValidating: false')
  })

  it('should update form values when values updates even with the same values', async () => {
    type FormValues = {
      firstName: string
    }

    function App() {
      const [firstName, setFirstName] = React.useState('C')
      const values = React.useMemo(() => ({ firstName }), [firstName])

      const {
        register,
        formState: { isDirty },
        watch,
      } = useForm<FormValues>({
        defaultValues: {
          firstName: 'C',
        },
        values,
        resetOptions: { keepDefaultValues: true },
      })
      const formValues = watch()

      return (
        <form>
          <button type="button" onClick={() => setFirstName('A')}>
            1
          </button>
          <button type="button" onClick={() => setFirstName('B')}>
            2
          </button>
          <button type="button" onClick={() => setFirstName('C')}>
            3
          </button>
          <input {...register('firstName')} placeholder="First Name" />
          <p>{isDirty ? 'dirty' : 'pristine'}</p>
          <p>{formValues.firstName}</p>
          <input type="submit" />
        </form>
      )
    }

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '1' }))

    await waitFor(() => {
      screen.getByText('A')
      screen.getByText('dirty')
    })

    fireEvent.click(screen.getByRole('button', { name: '2' }))

    await waitFor(() => {
      screen.getByText('B')
      screen.getByText('dirty')
    })

    fireEvent.click(screen.getByRole('button', { name: '3' }))

    await waitFor(() => {
      screen.getByText('C')
      screen.getByText('pristine')
    })
  })

  it('should disable the entire form inputs', async () => {
    function App() {
      const { register } = useForm({
        disabled: true,
        defaultValues: {
          lastName: '',
          firstName: '',
        },
      })

      return (
        <form>
          <input {...register('firstName')} placeholder="firstName" />
          <input {...register('lastName')} placeholder="lastName" />
        </form>
      )
    }

    render(<App />)

    await waitFor(() => {
      expect((screen.getByPlaceholderText('firstName') as HTMLInputElement).disabled).toBeTruthy()
      expect((screen.getByPlaceholderText('lastName') as HTMLInputElement).disabled).toBeTruthy()
    })
  })

  it('should disable the entire form', () => {
    const App = () => {
      const [disabled, setDisabled] = useState(false)
      const { register, control } = useForm({
        disabled,
      })

      return (
        <form>
          <input type={'checkbox'} {...register('checkbox')} data-testid={'checkbox'} />
          <input type={'radio'} {...register('radio')} data-testid={'radio'} />
          <input type={'range'} {...register('range')} data-testid={'range'} />
          <select {...register('select')} data-testid={'select'} />
          <textarea {...register('textarea')} data-testid={'textarea'} />

          <Controller
            control={control}
            render={({ field }) => {
              return <input disabled={field.disabled} data-testid={'controller'} />
            }}
            name="test"
          />

          <button
            type="button"
            onClick={() => {
              setDisabled(!disabled)
            }}
          >
            Submit
          </button>
        </form>
      )
    }

    render(<App />)

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByTestId('checkbox')).toHaveAttribute('disabled')
    expect(screen.getByTestId('radio')).toHaveAttribute('disabled')
    expect(screen.getByTestId('range')).toHaveAttribute('disabled')
    expect(screen.getByTestId('select')).toHaveAttribute('disabled')
    expect(screen.getByTestId('textarea')).toHaveAttribute('disabled')
    expect(screen.getByTestId('controller')).toHaveAttribute('disabled')

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByTestId('checkbox')).not.toBeDisabled()
    expect(screen.getByTestId('radio')).not.toBeDisabled()
    expect(screen.getByTestId('range')).not.toBeDisabled()
    expect(screen.getByTestId('select')).not.toBeDisabled()
    expect(screen.getByTestId('textarea')).not.toBeDisabled()
    expect(screen.getByTestId('controller')).not.toBeDisabled()
  })

  it('should be able to disable the entire form', async () => {
    const App = () => {
      const [disabled, setDisabled] = useState(false)
      const { register, handleSubmit } = useForm({
        disabled,
      })

      return (
        <form
          onSubmit={handleSubmit(async () => {
            setDisabled(true)
            await sleep(100)
            setDisabled(false)
          })}
        >
          <input type={'checkbox'} {...register('checkbox')} data-testid={'checkbox'} />
          <input type={'radio'} {...register('radio')} data-testid={'radio'} />
          <input type={'range'} {...register('range')} data-testid={'range'} />
          <select {...register('select')} data-testid={'select'} />
          <textarea {...register('textarea')} data-testid={'textarea'} />
          <button>Submit</button>
        </form>
      )
    }

    render(<App />)

    expect((screen.getByTestId('textarea') as HTMLTextAreaElement).disabled).toBeFalsy()
    expect((screen.getByTestId('range') as HTMLInputElement).disabled).toBeFalsy()
    expect((screen.getByTestId('select') as HTMLInputElement).disabled).toBeFalsy()
    expect((screen.getByTestId('textarea') as HTMLInputElement).disabled).toBeFalsy()

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect((screen.getByTestId('textarea') as HTMLTextAreaElement).disabled).toBeTruthy()
      expect((screen.getByTestId('range') as HTMLInputElement).disabled).toBeTruthy()
      expect((screen.getByTestId('select') as HTMLInputElement).disabled).toBeTruthy()
      expect((screen.getByTestId('textarea') as HTMLInputElement).disabled).toBeTruthy()
    })

    await waitFor(() => {
      expect((screen.getByTestId('textarea') as HTMLTextAreaElement).disabled).toBeFalsy()
      expect((screen.getByTestId('range') as HTMLInputElement).disabled).toBeFalsy()
      expect((screen.getByTestId('select') as HTMLInputElement).disabled).toBeFalsy()
      expect((screen.getByTestId('textarea') as HTMLInputElement).disabled).toBeFalsy()
    })
  })

  /**
   * This test doesn't make any sense.
   */
  it.skip('should not mutate defaultValues', () => {
    const defaultValues = {
      test: {
        test: '123',
        test1: '1234',
      },
    }

    const Form = () => {
      const { register, control } = useForm({
        defaultValues,
      })
      return (
        <>
          <input {...register('test.test', { shouldUnregister: true })} />
          <Controller
            control={control}
            shouldUnregister
            render={() => {
              return <input />
            }}
            name={'test.test1'}
          />
        </>
      )
    }

    const App = () => {
      const [show, setShow] = React.useState(true)
      return (
        <>
          {show && <Form />}
          <button
            type={'button'}
            onClick={() => {
              setShow(!show)
            }}
          >
            toggle
          </button>
        </>
      )
    }

    render(<App />)

    fireEvent.click(screen.getByRole('button'))

    fireEvent.click(screen.getByRole('button'))

    fireEvent.click(screen.getByRole('button'))

    expect(defaultValues).toEqual({
      test: {
        test: '123',
        test1: '1234',
      },
    })
  })

  /**
   * This one is literally a race condition.
   */
  it.skip('should not register or shallow defaultValues into submission data', () => {
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
})
