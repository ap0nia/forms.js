import { render, screen, fireEvent } from '@testing-library/react'
import { useForm, Controller } from 'react-hook-form'
import { describe, it, expect } from 'vitest'

describe('react-hook-form', () => {
  it.only('should reset value', async () => {
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
})
