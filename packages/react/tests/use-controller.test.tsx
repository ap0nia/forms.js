import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { describe, test, expect, vi } from 'vitest'

import { Controller } from '../src/controller'
import type { ReactFormControl } from '../src/form-control'
import { useController } from '../src/use-controller'
import { useForm } from '../src/use-form'

describe('useController', () => {
  test('renders input correctly', () => {
    const Component = () => {
      const { formControl } = useForm<{
        test: string
        test1: { test: string }[]
      }>()

      useController({ name: 'test', formControl, defaultValue: '' })

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
      const { field } = useController({ name: 'test', formControl })

      renderCounter[0]++

      return <input {...field} />
    }

    const Test1 = ({ formControl }: { formControl: ReactFormControl<FormValues> }) => {
      const {
        field,
        fieldState: { isDirty, isTouched },
      } = useController({
        name: 'test1',
        formControl,
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
      const { formControl } = useForm<FormValues>({
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
        const { formControl, watch } = useForm<{ test: string }>()

        watchResult.push(watch())

        const { field } = useController({ name: 'test', formControl, defaultValue: '' })

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
        const { formControl, watch } = useForm<{
          test: string
        }>()

        watchResult.push(watch())

        const { field } = useController({
          name: 'test',
          formControl,
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
        const { formControl, watch } = useForm<{
          test: string
        }>()

        watchResult.push(watch())

        const { field } = useController({
          name: 'test',
          formControl,
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
        const { formControl, watch } = useForm<{ test: string }>()

        watchResult.push(watch())

        const { field } = useController({
          name: 'test',
          formControl,
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
      const { field, formState } = useController({ formControl, name: 'test' })

      return (
        <>
          <input {...field} />
          <p>{formState.dirtyFields.test && 'dirty'}</p>
          <p>{formState.touchedFields.test && 'touched'}</p>
        </>
      )
    }

    const Component = () => {
      const { formControl } = useForm<FormValues>({
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
      const { formControl } = useForm({
        defaultValues: {
          test: 'bill',
        },
      })

      return (
        <Controller
          render={({ field }) => {
            return <input {...field} />
          }}
          formControl={formControl}
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
      const { formControl, setValue } = useForm()

      const { field } = useController({
        name: 'test',
        formControl,
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
        formControl,
        defaultValue: '',
      })

      return <input {...field} />
    }

    function App() {
      const { reset, formControl, setValue } = useForm<FormValues>()

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
        formControl,
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
      const { handleSubmit, formControl } = useForm<FormValues>({
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
})
