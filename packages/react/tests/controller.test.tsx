import {
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import React from 'react'
import { describe, it, expect, vi } from 'vitest'

import { Controller, type ControllerRenderProps } from '../src/controller'
import { useForm } from '../src/use-form'

function Input<TFieldValues extends Record<string, any>>({
  onChange,
  onBlur,
  placeholder,
}: Pick<ControllerRenderProps<TFieldValues>, 'onChange' | 'onBlur'> & {
  placeholder?: string
}) {
  return <input placeholder={placeholder} onChange={() => onChange(1)} onBlur={() => onBlur()} />
}

describe('Controller', () => {
  it('should render correctly with as with string', () => {
    const Component = () => {
      const { control } = useForm()
      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
        />
      )
    }

    render(<Component />)

    const input = screen.getByRole('textbox') as HTMLInputElement

    expect(input).toBeVisible()
    expect(input.name).toBe('test')
  })

  it('should render correctly with as with component', () => {
    const Component = () => {
      const { control } = useForm()
      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
        />
      )
    }

    render(<Component />)

    const input = screen.getByRole('textbox') as HTMLInputElement

    expect(input).toBeVisible()
    expect(input?.name).toBe('test')
  })

  it('should reset value', async () => {
    const Component = () => {
      const { reset, control } = useForm()

      return (
        <>
          <Controller
            defaultValue="default"
            name="test"
            render={({ field }) => <input {...field} />}
            control={control}
          />
          <button
            type="button"
            onClick={() =>
              reset({
                test: 'default',
              })
            }
          >
            reset
          </button>
        </>
      )
    }

    render(<Component />)

    fireEvent.input(screen.getByRole('textbox'), { target: { value: 'test' } })
    expect(screen.getByRole('textbox')).toHaveValue('test')

    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect(screen.getByRole('textbox')).toHaveValue('default')
  })

  it('should set defaultValue to value props when input was reset', () => {
    const Component = () => {
      const { reset, control } = useForm<{
        test: string
      }>()

      React.useEffect(() => {
        reset({ test: 'default' })
      }, [reset])

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
        />
      )
    }

    render(<Component />)

    expect(screen.getByRole('textbox')).toHaveValue('default')
  })

  it('should render when registered field values are updated', () => {
    const Component = () => {
      const { control } = useForm()
      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
        />
      )
    }

    render(<Component />)

    fireEvent.input(screen.getByRole('textbox'), { target: { value: 'test' } })

    expect(screen.getByRole('textbox')).toHaveValue('test')
  })

  it("should trigger component's onChange method and invoke setValue method", () => {
    let fieldValues: unknown
    const Component = () => {
      const { control, getValues } = useForm()

      return (
        <>
          <Controller
            defaultValue=""
            name="test"
            render={({ field }) => <input {...field} />}
            control={control}
          />
          <button onClick={() => (fieldValues = getValues())}>getValues</button>
        </>
      )
    }

    render(<Component />)

    fireEvent.input(screen.getByRole('textbox'), {
      target: { value: 'test' },
    })

    fireEvent.click(screen.getByRole('button', { name: /getValues/ }))

    expect(fieldValues).toEqual({ test: 'test' })
  })

  it("should trigger component's onChange method and invoke trigger method", async () => {
    let errors: any
    const Component = () => {
      const { control, ...rest } = useForm({ mode: 'onChange' })

      errors = rest.formState.errors

      return (
        <Controller
          defaultValue="test"
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
          rules={{ required: true }}
        />
      )
    }

    render(<Component />)

    fireEvent.input(screen.getByRole('textbox'), {
      target: { value: '' },
    })

    await waitFor(() => expect(errors.test).toBeDefined())
  })

  it("should trigger component's onBlur method and invoke trigger method", async () => {
    let errors: any
    const Component = () => {
      const { control, ...rest } = useForm({ mode: 'onBlur' })

      errors = rest.formState.errors

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
          rules={{ required: true }}
        />
      )
    }

    render(<Component />)

    fireEvent.blur(screen.getByRole('textbox'), {
      target: { value: '' },
    })

    await waitFor(() => expect(errors.test).toBeDefined())
  })

  it('should set field to formState.touchedFields', async () => {
    let touched: any
    const Component = () => {
      const { control, formState } = useForm({ mode: 'onBlur' })

      touched = formState.touchedFields

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
        />
      )
    }

    render(<Component />)

    fireEvent.blur(screen.getByRole('textbox'))

    // expect(touched).toEqual({ test: true })
    await waitFor(() => expect(touched).toEqual({ test: true }))
  })

  it('should call trigger method when re-validate mode is onBlur with blur event', async () => {
    const Component = () => {
      const {
        handleSubmit,
        control,
        formState: { errors },
      } = useForm({
        reValidateMode: 'onBlur',
      })

      return (
        <form onSubmit={handleSubmit(() => {})}>
          <Controller
            defaultValue=""
            name="test"
            render={({ field }) => <input {...field} />}
            control={control}
            rules={{ required: true }}
          />
          {/* errors.test && <span role="alert">required</span> */}
          {errors['test'] && <span role="alert">required</span>}
          <button>submit</button>
        </form>
      )
    }
    render(<Component />)

    fireEvent.blur(screen.getByRole('textbox'), {
      target: {
        value: '',
      },
    })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    fireEvent.submit(screen.getByRole('button'))

    fireEvent.input(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    })

    expect(await screen.findByRole('alert')).toBeVisible()

    fireEvent.blur(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    })

    await waitForElementToBeRemoved(screen.queryByRole('alert'))
  })

  it('should invoke custom event named method', () => {
    let fieldValues: any

    const Component = () => {
      const { control, getValues } = useForm()
      return (
        <>
          <Controller
            defaultValue=""
            name="test"
            render={({ field: props }) => {
              return <input {...props} />
            }}
            control={control}
          />
          <button onClick={() => (fieldValues = getValues())}>getValues</button>
        </>
      )
    }

    render(<Component />)

    fireEvent.input(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    })

    fireEvent.click(screen.getByRole('button', { name: /getValues/ }))

    expect(fieldValues).toEqual({ test: 'test' })
  })

  it('should invoke custom onChange method', () => {
    const onChange = vi.fn()

    const Component = () => {
      const { control } = useForm<{
        test: string
      }>()
      return (
        <>
          <Controller
            defaultValue=""
            name="test"
            render={({ field: { onBlur, value } }) => {
              return <Input placeholder="test" {...{ onChange, onBlur, value }} />
            }}
            control={control}
          />
        </>
      )
    }

    render(<Component />)

    fireEvent.input(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    })

    expect(onChange).toBeCalled()
  })

  it('should invoke custom onBlur method', () => {
    const onBlur = vi.fn()
    const Component = () => {
      const { control } = useForm()
      return (
        <>
          <Controller
            defaultValue=""
            name="test"
            render={({ field: { onChange, value } }) => {
              return <Input {...{ onChange, onBlur, value }} />
            }}
            control={control}
          />
        </>
      )
    }

    render(<Component />)

    fireEvent.blur(screen.getByRole('textbox'))

    expect(onBlur).toBeCalled()
  })

  it('should update rules when rules gets updated', () => {
    let fieldsRef: any
    const Component = ({ required = true }: { required?: boolean }) => {
      const { control } = useForm()

      fieldsRef = control._fields

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          rules={{ required }}
          control={control}
        />
      )
    }
    const { rerender } = render(<Component />)

    rerender(<Component required={false} />)

    expect(fieldsRef.test.required).toBeFalsy()
  })

  it('should set initial state from unmount state', () => {
    const Component = ({ isHide }: { isHide?: boolean }) => {
      const { control } = useForm()

      return isHide ? null : (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
        />
      )
    }

    const { rerender } = render(<Component />)

    fireEvent.input(screen.getByRole('textbox'), { target: { value: 'test' } })

    rerender(<Component isHide />)

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()

    rerender(<Component />)

    expect(screen.getByRole('textbox')).toHaveValue('test')
  })

  it('should skip validation when Controller is unmounted', async () => {
    const onValid = vi.fn()
    const onInvalid = vi.fn()

    const App = () => {
      const [show, setShow] = React.useState(true)

      const { control, handleSubmit } = useForm()

      return (
        <form onSubmit={handleSubmit(onValid, onInvalid)}>
          {show && (
            <Controller
              render={({ field }) => <input {...field} />}
              name={'test'}
              rules={{
                required: true,
              }}
              control={control}
            />
          )}
          <button type={'button'} onClick={() => setShow(false)}>
            toggle
          </button>
          <button>submit</button>
        </form>
      )
    }

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() => expect(onInvalid).toBeCalledTimes(1))
    expect(onValid).toBeCalledTimes(0)

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }))

    fireEvent.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() => expect(onValid).toBeCalledTimes(1))
    expect(onInvalid).toBeCalledTimes(1)
  })

  it.todo(
    'should not set initial state from unmount state when input is part of field array',
    () => {
      // const Component = () => {
      //   const { control } = useForm<{
      //     test: { value: string }[]
      //   }>()
      //   const { fields, append, remove } = useFieldArray({
      //     name: 'test',
      //     control,
      //   })
      //   return (
      //     <form>
      //       {fields.map((field, i) => (
      //         <Controller
      //           key={field.id}
      //           defaultValue={field.value}
      //           name={`test.${i}.value` as const}
      //           render={({ field }) => <input {...field} />}
      //           control={control}
      //         />
      //       ))}
      //       <button type="button" onClick={() => append({ value: 'test' })}>
      //         append
      //       </button>
      //       <button type="button" onClick={() => remove(0)}>
      //         remove
      //       </button>
      //     </form>
      //   )
      // }
      // render(<Component />)
      // fireEvent.click(screen.getByRole('button', { name: /append/i }))
      // fireEvent.input(screen.getByRole('textbox'), { target: { value: 'test' } })
      // fireEvent.click(screen.getByRole('button', { name: /remove/i }))
      // fireEvent.click(screen.getByRole('button', { name: /append/i }))
      // expect(screen.getByRole('textbox')).toHaveValue('test')
    },
  )

  it.todo('should not assign default value when field is removed with useFieldArray', () => {
    // const Component = () => {
    //   const { control } = useForm()
    //   const { fields, append, remove } = useFieldArray({
    //     control,
    //     name: 'test',
    //   })
    //   return (
    //     <form>
    //       {fields.map((field, i) => (
    //         <div key={field.id}>
    //           <Controller
    //             render={({ field }) => <input {...field} />}
    //             name={`test.${i}.value`}
    //             defaultValue={''}
    //             control={control}
    //           />
    //           <button type="button" onClick={() => remove(i)}>
    //             remove{i}
    //           </button>
    //         </div>
    //       ))}
    //       <button type="button" onClick={() => append({ value: '' })}>
    //         append
    //       </button>
    //     </form>
    //   )
    // }
    // render(<Component />)
    // fireEvent.click(screen.getByRole('button', { name: /append/i }))
    // fireEvent.click(screen.getByRole('button', { name: /append/i }))
    // fireEvent.click(screen.getByRole('button', { name: /append/i }))
    // const inputs = screen.getAllByRole('textbox')
    // fireEvent.input(inputs[0], {
    //   target: { value: '1' },
    // })
    // fireEvent.input(inputs[1], {
    //   target: { value: '2' },
    // })
    // fireEvent.input(inputs[2], {
    //   target: { value: '3' },
    // })
    // fireEvent.click(screen.getByRole('button', { name: /remove1/i }))
    // expect(screen.getAllByRole('textbox')[0]).toHaveValue('1')
    // expect(screen.getAllByRole('textbox')[1]).toHaveValue('3')
  })

  it('should validate input when input is touched and with onTouched mode', async () => {
    let currentErrors: any = {}

    const Component = () => {
      const {
        formState: { errors },
        control,
      } = useForm<{ test: string }>({
        mode: 'onTouched',
      })

      currentErrors = errors

      return (
        <form>
          <Controller
            name={'test'}
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <input {...field} />}
          />
        </form>
      )
    }

    render(<Component />)

    const input = screen.getByRole('textbox')

    fireEvent.blur(input)

    await waitFor(() => expect(currentErrors.test).not.toBeUndefined())

    fireEvent.input(input, {
      target: { value: '1' },
    })

    await waitFor(() => expect(currentErrors.test).toBeUndefined())
  })

  it.only('should show invalid input when there is an error', async () => {
    const Component = () => {
      const { control } = useForm({
        mode: 'onChange',
      })

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field: props, fieldState }) => {
            console.log({ props })
            return (
              <>
                <input {...props} />
                {fieldState.invalid && <p>Input is invalid.</p>}
              </>
            )
          }}
          control={control}
          rules={{
            required: true,
          }}
        />
      )
    }

    console.log('initial')
    render(<Component />)

    console.log('change1')
    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    })

    expect(screen.queryByText('Input is invalid.')).not.toBeInTheDocument()

    console.log('change2')
    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: '',
      },
    })

    expect(await screen.findByText('Input is invalid.')).toBeVisible()
  })
})
