import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { FormControlOptions } from '../../src/types/form'

/**
 * In order for the form control to potentially focus on an error:
 * - The mounted names must include the field name.
 * - The fields object must have the field.
 * - The errors writable must have a corresponding error.
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
    describe('focuses properly based on root options', () => {
      test('focuses error when root option is implicitly true', () => {
        const { formControl, ref } = createFocusableFormControl()

        formControl.focusError()

        expect(ref.focus).toHaveBeenCalledOnce()
      })

      test('focuses error when root option is explicitly true', () => {
        const { formControl, ref } = createFocusableFormControl({ shouldFocusError: true })

        formControl.focusError()

        expect(ref.focus).toHaveBeenCalledOnce()
      })

      test('does not focus error when root option is explicitly false', () => {
        const { formControl, ref } = createFocusableFormControl({ shouldFocusError: false })

        formControl.focusError()

        expect(ref.focus).not.toHaveBeenCalled()
      })
    })

    describe('prioritizes locally set options over root options', () => {
      test('focuses error when local option is true', () => {
        const { formControl, ref } = createFocusableFormControl({ shouldFocusError: false })

        formControl.focusError({ shouldFocus: true })

        expect(ref.focus).toHaveBeenCalledOnce()
      })

      test('does not focus error when local option is false', () => {
        const { formControl, ref } = createFocusableFormControl({ shouldFocusError: true })

        formControl.focusError({ shouldFocus: false })

        expect(ref.focus).not.toHaveBeenCalled()
      })
    })
  })
})
