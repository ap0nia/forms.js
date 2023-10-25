import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Controller } from '../src/controller'
import { useForm } from '../src/use-form'

// function Input<TFieldValues extends Record<string, any>>({
//   onChange,
//   onBlur,
//   placeholder,
// }: Pick<ControllerRenderProps<TFieldValues>, 'onChange' | 'onBlur'> & {
//   placeholder?: string
// }) {
//   return <input placeholder={placeholder} onChange={() => onChange(1)} onBlur={() => onBlur()} />
// }

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
})
