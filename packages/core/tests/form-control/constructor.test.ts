import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('constructor', () => {
    describe('correctly sets default values and values', () => {
      test('sets default values as empty if not provided', () => {
        const form = new FormControl()

        expect(form.state.values.value).toEqual({})
        expect(form.state.defaultValues.value).toEqual({})
      })

      test('sets default values as provided object', () => {
        const defaultValues = {
          a: 1,
          b: 2,
          c: 3,
        }

        const form = new FormControl({ defaultValues })

        expect(form.state.values.value).toEqual(defaultValues)
        expect(form.state.defaultValues.value).toEqual(defaultValues)
      })

      test('sets default values as result of provided function', () => {
        const defaultValues = {
          a: 1,
          b: 2,
          c: 3,
        }

        const form = new FormControl({ defaultValues: () => defaultValues })

        expect(form.state.values.value).toEqual(defaultValues)
        expect(form.state.defaultValues.value).toEqual(defaultValues)
      })

      test('sets values as provided values', () => {
        const values = {
          a: 1,
          b: 2,
          c: 3,
        }

        const form = new FormControl({ values })

        expect(form.state.values.value).toEqual(values)
        expect(form.state.defaultValues.value).toEqual(values)
      })

      test('sets values to empty object if shouldUnregister is true', () => {
        const values = {
          a: 1,
          b: 2,
          c: 3,
        }

        const form = new FormControl({ shouldUnregister: true, values })

        expect(form.state.values.value).toEqual({})
        expect(form.state.defaultValues.value).toEqual(values)
      })
    })

    describe('correctly sets initial state', () => {
      test('sets isLoading to true if default values is a promise', () => {
        const defaultValues = Promise.resolve({
          a: 1,
          b: 2,
          c: 3,
        })

        const form = new FormControl({ defaultValues })

        expect(form.state.isLoading.value).toBeTruthy()
      })

      test('sets submitCount to 0', () => {
        const form = new FormControl()
        expect(form.state.submitCount.value).toEqual(0)
      })

      test('sets all the boolean state to false', () => {
        const form = new FormControl()

        expect(form.state.isDirty.value).toBeFalsy()
        expect(form.state.isValidating.value).toBeFalsy()
        expect(form.state.isSubmitted.value).toBeFalsy()
        expect(form.state.isSubmitting.value).toBeFalsy()
        expect(form.state.isSubmitSuccessful.value).toBeFalsy()
        expect(form.state.isValidating.value).toBeFalsy()
        expect(form.state.isValid.value).toBeFalsy()
      })

      test('sets all the object state to empty objects', () => {
        const form = new FormControl()

        expect(form.state.errors.value).toEqual({})
        expect(form.state.touchedFields.value).toEqual({})
        expect(form.state.dirtyFields.value).toEqual({})
      })
    })

    describe('correctly sets options', () => {
      test('sets shouldCaptureDirtyFields to provided value of resetOptions.keepDirtyValues', () => {
        const form = new FormControl({ resetOptions: { keepDirtyValues: true } })

        expect(form.options.shouldCaptureDirtyFields).toBeTruthy()
      })
    })
  })
})
