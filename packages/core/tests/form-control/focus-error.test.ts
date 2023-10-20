import { describe, test, expect, vi } from 'vitest'

import { FormControl, type FormControlOptions } from '../../src/form-control'

/**
 * In order for the form control to potentially focus on an error:
 * - The field must be mounted.
 * - The field must exist in the fields record.
 * - The errors object must have an error for the field name.
 */
function createFocusableFormControl(options?: FormControlOptions) {
  const formControl = new FormControl(options)

  const name = 'test'

  const ref = document.createElement('input')
  ref.focus = vi.fn()

  formControl.names.mount.add(name)

  formControl.fields[name] = {
    _f: {
      name,
      ref,
    },
  }

  formControl.state.errors.set({
    [name]: [],
  })

  return { formControl, ref }
}

describe('FormControl', () => {
  describe('focusError', () => {
    describe('focuses properly according to root options', () => {
      test('focuses error when root option is undefined (set to true by default)', () => {
        const { formControl, ref } = createFocusableFormControl()

        formControl.focusError()

        expect(ref.focus).toHaveBeenCalledOnce()
      })

      test('does not focus error when root option is false', () => {
        const { formControl, ref } = createFocusableFormControl({ shouldFocusError: false })

        formControl.focusError()

        expect(ref.focus).not.toHaveBeenCalled()
      })

      test('focuses error with root option is explicitly true', () => {
        const { formControl, ref } = createFocusableFormControl({ shouldFocusError: true })

        formControl.focusError()

        expect(ref.focus).toHaveBeenCalled()
      })
    })

    describe('locally set options have higher priority than root options', () => {
      test('focuses error when local option is true', () => {
        const { formControl, ref } = createFocusableFormControl({ shouldFocusError: false })

        formControl.focusError({ shouldFocus: true })

        expect(ref.focus).toHaveBeenCalled()
      })

      test('does not focus error when local option is false', () => {
        const { formControl, ref } = createFocusableFormControl({ shouldFocusError: true })

        formControl.focusError({ shouldFocus: false })

        expect(ref.focus).not.toHaveBeenCalled()
      })
    })
  })
})
