import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('constructor', () => {
    describe('correctly sets values and default values', () => {
      test('sets values and default values to empty object if no values provided', () => {
        const formControl = new FormControl()

        expect(formControl.stores.values.value).toEqual({})
        expect(formControl.stores.defaultValues.value).toEqual({})
      })

      test('sets them to provided values', () => {
        const defaultValues = {
          a: 1,
          b: 2,
          c: 3,
        }

        const formControl = new FormControl({ defaultValues })

        expect(formControl.stores.values.value).toEqual(defaultValues)
        expect(formControl.stores.defaultValues.value).toEqual(defaultValues)
      })

      test('sets values and default values to the result of the provided function', () => {
        const defaultValues = {
          a: 1,
          b: 2,
          c: 3,
        }

        const formControl = new FormControl({ defaultValues: () => defaultValues })

        expect(formControl.stores.values.value).toEqual(defaultValues)
        expect(formControl.stores.defaultValues.value).toEqual(defaultValues)
      })

      test('sets values to empty object and default values to provided values if shouldUnregister is true', () => {
        const values = {
          a: 1,
          b: 2,
          c: 3,
        }

        const formControl = new FormControl({ shouldUnregister: true, values })

        expect(formControl.stores.values.value).toEqual({})
        expect(formControl.stores.defaultValues.value).toEqual(values)
      })
    })

    describe('correctly sets initial state', () => {
      test('sets isLoading to true and defaultValues to empty object if default values is a promise', () => {
        const defaultValues = Promise.resolve({
          a: 1,
          b: 2,
          c: 3,
        })

        const formControl = new FormControl({ defaultValues })

        expect(formControl.stores.isLoading.value).toBeTruthy()
        expect(formControl.stores.values.value).toEqual({})
        expect(formControl.stores.defaultValues.value).toEqual({})
      })

      test('sets submitCount to 0', () => {
        const formControl = new FormControl()

        expect(formControl.stores.submitCount.value).toEqual(0)
      })

      test('sets all the boolean writable stores to false', () => {
        const formControl = new FormControl()

        expect(formControl.stores.isDirty.value).toBeFalsy()
        expect(formControl.stores.isValidating.value).toBeFalsy()
        expect(formControl.stores.isSubmitted.value).toBeFalsy()
        expect(formControl.stores.isSubmitting.value).toBeFalsy()
        expect(formControl.stores.isSubmitSuccessful.value).toBeFalsy()
        expect(formControl.stores.isValidating.value).toBeFalsy()
        expect(formControl.stores.isValid.value).toBeFalsy()
      })

      test('sets all the object writable stores to empty objects', () => {
        const formControl = new FormControl()

        expect(formControl.stores.errors.value).toEqual({})
        expect(formControl.stores.touchedFields.value).toEqual({})
        expect(formControl.stores.dirtyFields.value).toEqual({})
      })
    })

    describe('correctly sets options', () => {
      test('sets shouldCaptureDirtyFields to provided value of resetOptions.keepDirtyValues', () => {
        const formControl = new FormControl({ resetOptions: { keepDirtyValues: true } })

        expect(formControl.options.shouldCaptureDirtyFields).toBeTruthy()
      })
    })
  })
})
