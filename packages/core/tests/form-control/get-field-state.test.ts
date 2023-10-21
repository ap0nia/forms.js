import { describe, test, expect } from 'vitest'

import { FormControl, type FormControlState } from '../../src/form-control'

describe('FormControl', () => {
  describe('getFieldState', () => {
    test('works with internal state', () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.state.errors.set({ [name]: [] })
      formControl.state.dirtyFields.set({ [name]: true })
      formControl.state.touchedFields.set({ [name]: true })

      expect(formControl.getFieldState(name)).toEqual({
        invalid: true,
        isDirty: true,
        isTouched: true,
        error: [],
      })
    })

    test('works with provided state', () => {
      const formControl = new FormControl()

      const name = 'test'

      const state: FormControlState<any> = {} as any

      state.errors = { [name]: [] }
      state.dirtyFields = { [name]: true }
      state.touchedFields = { [name]: true }

      expect(formControl.getFieldState(name, state)).toEqual({
        invalid: true,
        isDirty: true,
        isTouched: true,
        error: [],
      })

      test('works with both internal and provided state', () => {
        const formControl = new FormControl()

        formControl.state.errors.set({ test: [] })
        formControl.state.dirtyFields.set({ test: true })

        const name = 'test'

        const state: FormControlState<any> = {} as any

        state.touchedFields = { [name]: true }

        expect(formControl.getFieldState(name, state)).toEqual({
          invalid: true,
          isDirty: true,
          isTouched: true,
          error: [],
        })
      })
    })
  })
})
