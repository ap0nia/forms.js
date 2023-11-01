import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { FieldState, FormControlState } from '../../src/types/form'

describe('FormControl', () => {
  describe('getFieldState', () => {
    test('returns false and undefined if field does not exist', () => {
      const formControl = new FormControl()

      const name = 'non-existent-field'

      const expectedFormState: FieldState = {
        invalid: false,
        isDirty: false,
        isTouched: false,
        error: undefined,
      }

      expect(formControl.getFieldState(name)).toEqual(expectedFormState)
    })

    test('returns correct field state when no form state is provided', () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.stores.errors.set({ [name]: [] })
      formControl.stores.dirtyFields.set({ [name]: true })
      formControl.stores.touchedFields.set({ [name]: true })

      const expectedFormState: FieldState = {
        invalid: true,
        isDirty: true,
        isTouched: true,
        error: [],
      }

      expect(formControl.getFieldState(name)).toEqual(expectedFormState)
    })

    test('returns correct field state when provided with a form state', () => {
      const formControl = new FormControl()

      const name = 'test'

      const state: FormControlState<any> = {} as any

      state.errors = { [name]: [] }
      state.dirtyFields = { [name]: true }
      state.touchedFields = { [name]: true }

      const expectedFormState: FieldState = {
        invalid: true,
        isDirty: true,
        isTouched: true,
        error: [],
      }

      expect(formControl.getFieldState(name, state)).toEqual(expectedFormState)
    })

    test('returns correct field state when provided with both internal and provided state', () => {
      const formControl = new FormControl()

      formControl.stores.errors.set({ test: [] })
      formControl.stores.dirtyFields.set({ test: true })

      const name = 'test'

      const state: FormControlState<any> = {
        [name]: true,
      } as any

      const expectedFormState: FieldState = {
        invalid: true,
        isDirty: true,
        isTouched: false,
        error: [],
      }

      expect(formControl.getFieldState(name, state)).toEqual(expectedFormState)
    })

    describe('satisfies invariants', () => {
      test('does not update state', () => {
        const formControl = new FormControl()

        const fn = vi.fn()

        formControl.getFieldState('a')

        formControl.state.subscribe(fn, undefined, false)

        expect(fn).not.toHaveBeenCalled()
      })
    })
  })
})
