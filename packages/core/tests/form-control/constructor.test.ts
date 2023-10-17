import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('constructor', () => {
    test('no default values and no values sets both as empty object', () => {
      const form = new FormControl()

      expect(form.state.defaultValues.value).toEqual({})

      expect(form.state.values.value).toEqual({})
    })

    test('default values and no values sets both', () => {
      const defaultValues = { foo: 'bar' }

      const form = new FormControl({ defaultValues })

      expect(form.state.defaultValues.value).toEqual(defaultValues)

      expect(form.state.values.value).toEqual(defaultValues)
    })

    test('default values as function and no values sets both', () => {
      const defaultValues = () => ({ foo: 'bar' })

      const form = new FormControl({ defaultValues })

      expect(form.state.defaultValues.value).toEqual(defaultValues())

      expect(form.state.values.value).toEqual(defaultValues())
    })

    test('values and no default values sets both', () => {
      const values = { foo: 'bar' }

      const form = new FormControl({ values })

      expect(form.state.defaultValues.value).toEqual(values)

      expect(form.state.values.value).toEqual(values)
    })

    test('shouldUnregister and default values does not set values', () => {
      const defaultValues = { foo: 'bar' }

      const form = new FormControl({ defaultValues, shouldUnregister: true })

      expect(form.state.defaultValues.value).toEqual(defaultValues)

      expect(form.state.values.value).toEqual({})
    })

    test('shouldCaptureDirtyFields is true if specified by resetOptions', () => {
      const form = new FormControl({
        resetOptions: { keepDirtyValues: true },
      })

      expect(form.options.shouldCaptureDirtyFields).toBeTruthy()
    })
  })
})
