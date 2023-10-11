import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { describe, test, expect } from 'vitest'

import { Controller } from '../src/controller'
import { useForm } from '../src/use-form'

describe('Controller', () => {
  test('should render correctly with as with string', () => {
    const Component = () => {
      const { control: formControl } = useForm()

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={formControl}
        />
      )
    }

    render(<Component />)

    const input = screen.getByRole('textbox') as HTMLInputElement

    expect(input).toBeTruthy()
    expect(input.name).toBe('test')
  })

  test('should render correctly with as with component', () => {
    const Component = () => {
      const { control: formControl } = useForm()

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={formControl}
        />
      )
    }

    render(<Component />)

    const input = screen.getByRole('textbox') as HTMLInputElement

    expect(input).toBeTruthy()
    expect(input?.name).toBe('test')
  })

  test('should reset value', async () => {
    const Component = () => {
      const { reset, control: formControl } = useForm()

      return (
        <>
          <Controller
            defaultValue="default"
            name="test"
            render={({ field }) => <input {...field} />}
            control={formControl}
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
    await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue('test'))

    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue('default'))
  })

  test('should set defaultValue to value props when input was reset', () => {
    const Component = () => {
      const { reset, control: formControl } = useForm<{ test: string }>()

      useEffect(() => {
        reset({ test: 'default' })
      }, [reset])

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={formControl}
        />
      )
    }

    render(<Component />)

    expect(screen.getByRole('textbox')).toHaveValue('default')
  })

  test('should render when registered field values are updated', () => {
    const Component = () => {
      const { control: formControl } = useForm()

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={formControl}
        />
      )
    }

    render(<Component />)

    fireEvent.input(screen.getByRole('textbox'), { target: { value: 'test' } })

    expect(screen.getByRole('textbox')).toHaveValue('test')
  })

  test("should trigger component's onChange method and invoke setValue method", () => {
    let fieldValues: unknown

    const Component = () => {
      const { control: formControl, getValues } = useForm()

      return (
        <>
          <Controller
            defaultValue=""
            name="test"
            render={({ field }) => <input {...field} />}
            control={formControl}
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

  test("should trigger component's onChange method and invoke trigger method", async () => {
    let errors: any

    const Component = () => {
      const { control: formControl, ...rest } = useForm({ mode: 'onChange' })

      errors = rest.formState.errors

      return (
        <Controller
          defaultValue="test"
          name="test"
          render={({ field }) => <input {...field} />}
          control={formControl}
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

  test.only("should trigger component's onBlur method and invoke trigger method", async () => {
    let errors: any
    const Component = () => {
      const { control: formControl, ...rest } = useForm({ mode: 'onBlur' })

      errors = rest.formState.errors

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={formControl}
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
})
