import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, test, expect } from 'vitest'

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

  test.only('should only subscribe to formState at each useContoller level', async () => {
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

      console.log('here')

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

    // fireEvent.change(screen.getAllByRole('textbox')[0], {
    //   target: {
    //     value: '1232',
    //   },
    // })

    // fireEvent.blur(screen.getAllByRole('textbox')[0])

    // expect(renderCounter).toEqual([2, 5])
  })
})
