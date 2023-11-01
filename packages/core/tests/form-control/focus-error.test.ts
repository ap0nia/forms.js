import { describe, test, expect, vi } from 'vitest'

import { trackAll } from '../../src/extensions/track-all'
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

  formControl.names.mount.add(name)

  const focus = vi.fn()

  formControl.fields[name] = {
    _f: {
      name,
      ref: {
        name,
        focus,
      },
    },
  }

  formControl.stores.errors.set({ [name]: [] })

  return { formControl, focus }
}

describe('FormControl', () => {
  describe('focusError', () => {
    describe('focuses error properly based on root options', () => {
      test('focuses error when root option is implicitly true', () => {
        const { formControl, focus } = createFocusableFormControl()

        formControl.focusError()

        expect(focus).toHaveBeenCalledOnce()
      })

      test('focuses error when root option is explicitly true', () => {
        const { formControl, focus } = createFocusableFormControl({ shouldFocusError: true })

        formControl.focusError()

        expect(focus).toHaveBeenCalledOnce()
      })

      test('does not focus error when root option is explicitly false', () => {
        const { formControl, focus } = createFocusableFormControl({ shouldFocusError: false })

        formControl.focusError()

        expect(focus).not.toHaveBeenCalled()
      })
    })

    describe('prioritizes locally set options over root options', () => {
      test('focuses error when local option is true', () => {
        const { formControl, focus } = createFocusableFormControl({ shouldFocusError: false })

        formControl.focusError({ shouldFocus: true })

        expect(focus).toHaveBeenCalledOnce()
      })

      test('does not focus error when local option is false', () => {
        const { formControl, focus } = createFocusableFormControl({ shouldFocusError: true })

        formControl.focusError({ shouldFocus: false })

        expect(focus).not.toHaveBeenCalled()
      })
    })

    describe('satisfies invariants', () => {
      test('does not update state', () => {
        const { formControl } = createFocusableFormControl()

        const fn = vi.fn()

        formControl.state.subscribe(fn, undefined, false)

        trackAll(formControl)

        formControl.focusError()

        expect(fn).not.toHaveBeenCalled()
      })
    })
  })
})
