import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import type { FlattenObject } from 'packages/core/src/utils/types/flatten-object'
import { useEffect, useState, StrictMode } from 'react'
import { describe, test, expect, vi } from 'vitest'

import { Controller } from '../src/controller'
import type { ReactFormControl } from '../src/form-control'
import { FormControlProvider } from '../src/form-provider'
import { useController } from '../src/use-controller'
import { useForm } from '../src/use-form'
import { useFormControlContext } from '../src/use-form-context'

describe('useController', () => {
  test('renders input correctly', () => {
    const Component = () => {
      const { control: formControl } = useForm<{
        test: string
        test1: { test: string }[]
      }>()

      useController({ name: 'test', control: formControl, defaultValue: '' })

      return null
    }

    expect(() => render(<Component />)).not.toThrowError()
  })

  test('should only subscribe to formState at each useContoller level', async () => {
    const renderCounter = [0, 0]

    type FormValues = {
      test: string
      test1: string
    }

    const Test = ({ formControl }: { formControl: ReactFormControl<FormValues> }) => {
      const { field } = useController({ name: 'test', control: formControl })

      renderCounter[0]++

      return <input {...field} />
    }

    const Test1 = ({ formControl }: { formControl: ReactFormControl<FormValues> }) => {
      const {
        field,
        fieldState: { isDirty, isTouched },
      } = useController({
        name: 'test1',
        control: formControl,
      })

      renderCounter[1]++

      return (
        <div>
          <input {...field} />
          {isDirty && <p>isDirty</p>}
          {isTouched && <p>isTouched</p>}
        </div>
      )
    }

    const Component = () => {
      const { control: formControl } = useForm<FormValues>({
        defaultValues: { test: '', test1: '' },
      })

      return (
        <div>
          <Test formControl={formControl} />
          <Test1 formControl={formControl} />
        </div>
      )
    }

    render(<Component />)

    expect(renderCounter).toEqual([1, 1])

    const [test, test1] = screen.getAllByRole('textbox')

    expect(test).not.toBeNull()
    expect(test1).not.toBeNull()

    if (!test || !test1) {
      return
    }

    fireEvent.change(test1, {
      target: {
        value: '1232',
      },
    })

    await waitFor(() => expect(screen.getByText('isDirty')).toBeTruthy())

    fireEvent.blur(test1)

    await waitFor(() => expect(screen.getByText('isTouched')).toBeTruthy())

    expect(renderCounter).toEqual([1, 3])

    fireEvent.change(test, {
      target: {
        value: '1232',
      },
    })

    fireEvent.blur(test)

    // expect(renderCounter).toEqual([2, 5])
    expect(renderCounter).toEqual([3, 3])
  })

  describe('checkbox', () => {
    test('should work for checkbox by spread the field object', async () => {
      const watchResult: unknown[] = []

      const Component = () => {
        const { control: formControl, watch } = useForm<{ test: string }>()

        watchResult.push(watch())

        const { field } = useController({ name: 'test', control: formControl, defaultValue: '' })

        return <input type="checkbox" {...field} />
      }

      render(<Component />)

      await waitFor(() => expect(watchResult).toEqual([{}]))

      fireEvent.click(screen.getByRole('checkbox'))

      await waitFor(() => expect(watchResult).toEqual([{}, { test: true }]))

      fireEvent.click(screen.getByRole('checkbox'))

      await waitFor(() => expect(watchResult).toEqual([{}, { test: true }, { test: false }]))
    })

    test('should work for checkbox by assign checked', async () => {
      const watchResult: unknown[] = []
      const Component = () => {
        const { control: formControl, watch } = useForm<{
          test: string
        }>()

        watchResult.push(watch())

        const { field } = useController({
          name: 'test',
          control: formControl,
          defaultValue: '',
        })

        return (
          <input
            type="checkbox"
            checked={!!field.value}
            onChange={(e) => field.onChange(e.target.checked)}
          />
        )
      }

      render(<Component />)

      await waitFor(() => expect(watchResult).toEqual([{}]))

      fireEvent.click(screen.getByRole('checkbox'))

      await waitFor(() => expect(watchResult).toEqual([{}, { test: true }]))

      fireEvent.click(screen.getByRole('checkbox'))

      await waitFor(() => expect(watchResult).toEqual([{}, { test: true }, { test: false }]))
    })

    test('should work for checkbox by assign checked', async () => {
      const watchResult: unknown[] = []
      const Component = () => {
        const { control: formControl, watch } = useForm<{
          test: string
        }>()

        watchResult.push(watch())

        const { field } = useController({
          name: 'test',
          control: formControl,
          defaultValue: '',
        })

        return (
          <input
            type="checkbox"
            checked={!!field.value}
            onChange={(e) => field.onChange(e.target.checked)}
          />
        )
      }

      render(<Component />)

      await waitFor(() => expect(watchResult).toEqual([{}]))

      fireEvent.click(screen.getByRole('checkbox'))

      await waitFor(() => expect(watchResult).toEqual([{}, { test: true }]))

      fireEvent.click(screen.getByRole('checkbox'))

      await waitFor(() => expect(watchResult).toEqual([{}, { test: true }, { test: false }]))
    })

    test('should work for checkbox by assign value manually', async () => {
      const watchResult: unknown[] = []
      const Component = () => {
        const { control: formControl, watch } = useForm<{ test: string }>()

        watchResult.push(watch())

        const { field } = useController({
          name: 'test',
          control: formControl,
          defaultValue: '',
        })

        return (
          <input
            value="on"
            type="checkbox"
            checked={!!field.value}
            onChange={(e) => field.onChange(e.target.checked ? e.target.value : false)}
          />
        )
      }

      render(<Component />)

      await waitFor(() => expect(watchResult).toEqual([{}]))

      fireEvent.click(screen.getByRole('checkbox'))

      await waitFor(() => expect(watchResult).toEqual([{}, { test: 'on' }]))

      fireEvent.click(screen.getByRole('checkbox'))

      await waitFor(() => expect(watchResult).toEqual([{}, { test: 'on' }, { test: false }]))
    })
  })

  test('should subscribe to formState update with trigger re-render at root', () => {
    type FormValues = {
      test: string
    }

    let counter = 0

    const Test = ({ formControl }: { formControl: ReactFormControl<FormValues> }) => {
      const { field, formState } = useController({ control: formControl, name: 'test' })

      return (
        <>
          <input {...field} />
          <p>{formState.dirtyFields.test && 'dirty'}</p>
          <p>{formState.touchedFields.test && 'touched'}</p>
        </>
      )
    }

    const Component = () => {
      const { control: formControl } = useForm<FormValues>({
        defaultValues: { test: '' },
      })

      counter++

      return <Test formControl={formControl} />
    }

    render(<Component />)

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    })

    fireEvent.blur(screen.getByRole('textbox'))

    expect(counter).toEqual(1)
    expect(screen.getByText('dirty')).toBeTruthy()
    expect(screen.getByText('touched')).toBeTruthy()
  })

  test('should not overwrite defaultValues with defaultValue', () => {
    const App = () => {
      const { control: formControl } = useForm({
        defaultValues: {
          test: 'bill',
        },
      })

      return (
        <Controller
          render={({ field }) => {
            return <input {...field} />
          }}
          control={formControl}
          name={'test'}
          defaultValue={'luo'}
        />
      )
    }

    render(<App />)

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('bill')
  })

  test('should be able to update input value without ref', async () => {
    const App = () => {
      const { control: formControl, setValue } = useForm()

      const { field } = useController({
        name: 'test',
        control: formControl,
        defaultValue: '',
      })

      return (
        <div>
          <input value={field.value} onChange={field.onChange} />
          <button
            onClick={() => {
              setValue('test', 'data')
            }}
          >
            setValue
          </button>
        </div>
      )
    }

    render(<App />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() =>
      expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual('data'),
    )
  })

  test('should be able to setValue after reset', async () => {
    let renderCount = 0

    type FormValues = {
      name: string
    }

    const Input = ({ formControl }: { formControl: ReactFormControl<FormValues> }) => {
      renderCount++

      const { field } = useController({
        name: 'name',
        control: formControl,
        defaultValue: '',
      })

      return <input {...field} />
    }

    function App() {
      const { reset, control: formControl, setValue } = useForm<FormValues>()

      useEffect(() => {
        reset({ name: 'initial' })
      }, [reset])

      return (
        <div>
          <Input formControl={formControl} />
          <button type="button" onClick={() => setValue('name', 'test', {})}>
            setValue
          </button>
        </div>
      )
    }

    render(<App />)

    fireEvent.click(screen.getByRole('button'))

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual('test')
    expect(renderCount).toEqual(3)
  })

  test('should invoke native validation with Controller', async () => {
    const setCustomValidity = vi.fn()
    const reportValidity = vi.fn()
    const focus = vi.fn()
    const message = 'This is required'

    type FormValues = {
      test: string
    }

    function Input({ formControl }: { formControl: ReactFormControl<FormValues> }) {
      const { field } = useController({
        control: formControl,
        rules: { required: message },
        name: 'test',
      })

      return (
        <div>
          <input
            {...field}
            ref={() => {
              field.ref({ focus, setCustomValidity, reportValidity } as any)
            }}
          />
        </div>
      )
    }

    function App() {
      const { handleSubmit, control: formControl } = useForm<FormValues>({
        defaultValues: {
          test: '',
        },
        mode: 'onChange',
        shouldUseNativeValidation: true,
      })

      return (
        <form onSubmit={handleSubmit(() => {})}>
          <Input formControl={formControl} />
          <input type="submit" />
        </form>
      )
    }

    render(<App />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(focus).toBeCalled())
    expect(setCustomValidity).toBeCalledWith(message)
    expect(reportValidity).toBeCalled()

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'bill',
      },
    })

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(setCustomValidity).toBeCalledTimes(3))
    expect(reportValidity).toBeCalledTimes(3)
    expect(focus).toBeCalledTimes(2)
  })

  test('should update with inline defaultValue', async () => {
    const onSubmit = vi.fn()

    const App = () => {
      const { control: formControl, handleSubmit } = useForm()

      useController({ control: formControl, defaultValue: 'test', name: 'test' })

      return (
        <form
          onSubmit={handleSubmit((data) => {
            onSubmit(data)
          })}
        >
          <button>submit</button>
        </form>
      )
    }

    render(<App />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() =>
      expect(onSubmit).toBeCalledWith({
        test: 'test',
      }),
    )
  })

  test('should return defaultValues when component is not yet mounted', async () => {
    const defaultValues = {
      test: {
        deep: [
          {
            test: '0',
            test1: '1',
          },
        ],
      },
    }

    const App = () => {
      const { control: formControl, getValues } = useForm<{
        test: {
          deep: { test: string; test1: string }[]
        }
      }>({
        defaultValues,
      })

      const { field } = useController({
        control: formControl,
        name: 'test.deep.0.test',
      })

      return (
        <div>
          <input {...field} />
          <p>{JSON.stringify(getValues())}</p>
        </div>
      )
    }

    render(<App />)

    expect(true).toEqual(true)

    expect(await screen.findByText('{"test":{"deep":[{"test":"0","test1":"1"}]}}')).toBeTruthy()
  })

  test('should trigger extra re-render and update latest value when setValue called during mount', async () => {
    const Child = () => {
      const { formControl } = useFormControlContext()

      const {
        field: { value },
      } = useController({ name: 'content' })

      useEffect(() => {
        formControl.setValue('content', 'expected value')
      }, [formControl.setValue])

      return <p>{value}</p>
    }

    function App() {
      const { control: formControl } = useForm({
        defaultValues: {
          content: 'default',
        },
      })

      return (
        <FormControlProvider control={formControl}>
          <form>
            <Child />
            <input type="submit" />
          </form>
        </FormControlProvider>
      )
    }

    render(<App />)

    expect(await screen.findByText('expected value')).toBeTruthy()
  })

  test('should remount with input with current formValue', () => {
    let data: unknown

    function Input<T extends Record<string, any>>({
      formControl,
      name,
    }: {
      formControl: ReactFormControl<T>
      name: Extract<keyof FlattenObject<T>, string>
    }) {
      const {
        field: { value },
      } = useController({ control: formControl, name, shouldUnregister: true })

      data = value

      return null
    }

    const App = () => {
      const { control: formControl } = useForm<{
        test: string
      }>({
        defaultValues: {
          test: 'test',
        },
      })

      const [toggle, setToggle] = useState(true)

      return (
        <div>
          {toggle && <Input formControl={formControl} name={'test'} />}
          <button onClick={() => setToggle(!toggle)}>toggle</button>
        </div>
      )
    }

    render(<App />)

    expect(data).toEqual('test')

    fireEvent.click(screen.getByRole('button'))

    fireEvent.click(screen.getByRole('button'))

    expect(data).toBeUndefined()
  })

  test('should always get the latest value for onBlur event', async () => {
    const watchResults: unknown[] = []

    const App = () => {
      const { control: formControl, watch } = useForm()

      const { field } = useController({ control: formControl, name: 'test', defaultValue: '' })

      watchResults.push(watch())

      return (
        <button
          onClick={() => {
            field.onChange('updated value')
            field.onBlur()
          }}
        >
          test
        </button>
      )
    }

    render(<App />)

    fireEvent.click(screen.getByRole('button'), {
      target: {
        value: 'test',
      },
    })

    expect(watchResults).toEqual([
      { test: '' },
      {
        test: 'updated value',
      },
    ])

    // expect(watchResults).toEqual([
    //   {},
    //   {
    //     test: 'updated value',
    //   },
    // ])
  })

  test('should focus and select the input text', () => {
    const select = vi.fn()
    const focus = vi.fn()

    const App = () => {
      const { control: formControl, setFocus } = useForm({
        defaultValues: {
          test: 'data',
        },
      })

      const { field } = useController({ control: formControl, name: 'test' })

      field.ref({ select, focus } as any)

      useEffect(() => {
        setFocus('test', { shouldSelect: true })
      }, [setFocus])

      return null
    }

    render(<App />)

    expect(select).toBeCalled()
    expect(focus).toBeCalled()
  })

  test('should update isValid correctly with strict mode', async () => {
    const App = () => {
      const form = useForm({
        mode: 'onChange',
        defaultValues: {
          name: '',
        },
      })

      const { isValid } = form.formState

      return (
        <StrictMode>
          <FormControlProvider {...form}>
            <Controller
              render={({ field }) => <input value={field.value} onChange={field.onChange} />}
              name="name"
              rules={{
                required: true,
              }}
            />
            <p>{isValid ? 'valid' : 'not'}</p>
          </FormControlProvider>
        </StrictMode>
      )
    }

    render(<App />)

    await waitFor(() => {
      screen.getByText('not')
    })
  })

  test('should disable the controller input', async () => {
    function Form() {
      const { field } = useController({ name: 'lastName' })

      return <p>{field.disabled ? 'disabled' : ''}</p>
    }

    function App() {
      const methods = useForm({ disabled: true })

      return (
        <FormControlProvider {...methods}>
          <form>
            <Form />
          </form>
        </FormControlProvider>
      )
    }

    render(<App />)

    await waitFor(() => {
      screen.getByText('disabled')
    })
  })

  test('should disable form input with disabled prop', async () => {
    const App = () => {
      const [disabled, setDisabled] = useState(false)
      const { control: formControl, watch } = useForm({
        defaultValues: {
          test: 'test',
        },
      })

      const {
        field: { disabled: disabledProps },
      } = useController({
        control: formControl,
        name: 'test',
        disabled,
      })

      const input = watch('test')

      return (
        <form>
          <p>{input}</p>
          <button
            onClick={() => {
              setDisabled(!disabled)
            }}
            type={'button'}
          >
            toggle
          </button>
          <p>{disabledProps ? 'disable' : 'notDisabled'}</p>
        </form>
      )
    }

    render(<App />)

    screen.getByText('test')
    screen.getByText('notDisabled')

    fireEvent.click(screen.getByRole('button'))

    // FIXME: this doesn't do anything.
    waitFor(() => {
      screen.getByText('')
      screen.getByText('disable')
    })
  })
})
