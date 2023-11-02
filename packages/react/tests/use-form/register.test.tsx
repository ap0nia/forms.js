import type { RegisterOptions } from '@forms.js/core'
import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'

import type { ControlOptions } from '../../src/control'
import { useForm } from '../../src/use-form'

const name = 'name'

type ComponentProps = {
  form?: ControlOptions
  register?: RegisterOptions
}

/**
 * Helper component that initializes a single form and renders a single input.
 */
function Component(props: ComponentProps) {
  const form = useForm(props.form)

  return <input {...form.register(name, props.register)} />
}

/**
 * All progressive properties assignable to an input.
 */
const progressiveProps: RegisterOptions = {
  required: true,
  min: 1,
  max: 4,
  minLength: 1,
  maxLength: 4,
}

describe('control', () => {
  describe('register', () => {
    describe('correctly sets disabled status on input', () => {
      test('disables input if disabled prop is true', () => {
        render(<Component register={{ disabled: true }} />)

        expect(screen.getByRole('textbox')).toBeDisabled()
      })

      test('does not disable input if disabled prop is false', () => {
        render(<Component register={{ disabled: false }} />)

        expect(screen.getByRole('textbox')).not.toBeDisabled()
      })

      test('does not disable input if disabled prop is not provided', () => {
        render(<Component />)

        expect(screen.getByRole('textbox')).not.toBeDisabled()
      })
    })

    test('does not assign progressive properties to input if progressive prop is false', () => {
      render(<Component form={{ progressive: false }} register={progressiveProps} />)

      expect(screen.getByRole('textbox')).not.toBeRequired()
      expect(screen.getByRole('textbox')).not.toHaveAttribute('min')
      expect(screen.getByRole('textbox')).not.toHaveAttribute('max')
      expect(screen.getByRole('textbox')).not.toHaveAttribute('minLength')
      expect(screen.getByRole('textbox')).not.toHaveAttribute('maxLength')
    })

    test('assigns progressive properties to input if progressive prop is true', () => {
      render(<Component form={{ progressive: true }} register={progressiveProps} />)

      expect(screen.getByRole('textbox')).toBeRequired()
      expect(screen.getByRole('textbox')).toHaveAttribute('min', '1')
      expect(screen.getByRole('textbox')).toHaveAttribute('max', '4')
      expect(screen.getByRole('textbox')).toHaveAttribute('minLength', '1')
      expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '4')
    })

    describe('correctly assigns progressive properties on input', () => {
      describe('required', () => {
        test('makes input required if required prop is true', () => {
          render(<Component form={{ progressive: true }} register={{ required: true }} />)

          expect(screen.getByRole('textbox')).toBeRequired()
        })

        test('does not make input required if required prop is false', () => {
          render(<Component form={{ progressive: true }} register={{ required: false }} />)

          expect(screen.getByRole('textbox')).not.toBeRequired()
        })

        test('does not make input required if required prop is not provided', () => {
          render(<Component form={{ progressive: true }} />)

          expect(screen.getByRole('textbox')).not.toBeRequired()
        })
      })

      describe.todo('min', () => {})

      describe.todo('max', () => {})

      describe.todo('minLength', () => {})

      describe.todo('maxLength', () => {})

      describe.todo('pattern', () => {})
    })

    test('registering inputs never re-renders the component', () => {
      let renderCount = 0

      function Component(props: ComponentProps) {
        const form = useForm(props.form)

        renderCount++

        return (
          <div>
            <input {...form.register('a', props.register)} />
            <input {...form.register('b', props.register)} />
            <input {...form.register('c', props.register)} />
            <input {...form.register('d', props.register)} />
          </div>
        )
      }

      const { unmount } = render(<Component />)

      unmount()

      expect(renderCount).toEqual(1)
    })
  })
})
