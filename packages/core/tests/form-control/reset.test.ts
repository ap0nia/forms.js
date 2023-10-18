import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('reset', () => {
    test('unsets all names', () => {
      const form = new FormControl()

      form.reset()

      expect(form.names.mount).toHaveLength(0)
      expect(form.names.unMount).toHaveLength(0)
      expect(form.names.array).toHaveLength(0)
    })

    describe('submitCount', () => {
      test('resets submitCount if keepSubmitCount is false', () => {
        const form = new FormControl()

        form.state.submitCount.set(1)

        form.reset()

        expect(form.state.submitCount.value).toEqual(0)
      })

      test('preserves submitCount if keepSubmitCount is true', () => {
        const form = new FormControl()

        form.state.submitCount.set(1)

        form.reset({}, { keepSubmitCount: true })

        expect(form.state.submitCount.value).toEqual(1)
      })
    })

    describe('touchedFields', () => {
      test('resets touchedFields if keepTouchedFields is false', () => {
        const form = new FormControl()

        form.state.touchedFields.set({ foo: true })

        form.reset()

        expect(form.state.touchedFields.value).toEqual({})
      })

      test('preserves touchedFields if keepTouchedFields is true', () => {
        const form = new FormControl()

        form.state.touchedFields.set({ foo: true })

        form.reset({}, { keepTouched: true })

        expect(form.state.touchedFields.value).toEqual({ foo: true })
      })
    })

    describe('isSubmitSuccessful', () => {
      test('resets isSubmitSuccessful if keepIsSubmitSuccessful is false', () => {
        const form = new FormControl()

        form.state.isSubmitSuccessful.set(true)

        form.reset()

        expect(form.state.isSubmitSuccessful.value).toEqual(false)
      })

      test('preserves isSubmitSuccessful if keepIsSubmitSuccessful is true', () => {
        const form = new FormControl()

        form.state.isSubmitSuccessful.set(true)

        form.reset({}, { keepIsSubmitSuccessful: true })

        expect(form.state.isSubmitSuccessful.value).toEqual(true)
      })
    })

    describe('defaultValues', () => {
      test('resets defaultValues if keepDefaultValues is false', () => {
        const form = new FormControl({ defaultValues: { foo: 'bar' } })

        form.reset({ foo: 'bar-baz' })

        expect(form.state.defaultValues.value).toEqual({ foo: 'bar-baz' })
      })

      test('preserves defaultValues if keepDefaultValues is true', () => {
        const form = new FormControl({ defaultValues: { foo: 'bar' } })

        form.reset({ foo: 'bar-baz' }, { keepDefaultValues: true })

        expect(form.state.defaultValues.value).toEqual({ foo: 'bar' })
      })
    })

    describe('values', () => {
      test('empty object if shouldUnregister is true and keepDefaultValues is false', () => {
        const form = new FormControl({ defaultValues: { foo: 'bar' }, shouldUnregister: true })

        form.reset()

        expect(form.state.values.value).toEqual({})
      })

      test('default values if shouldUnregister is true and keepDefaultValues is true', () => {
        const form = new FormControl({ defaultValues: { foo: 'bar' }, shouldUnregister: true })

        form.reset({}, { keepDefaultValues: true })

        expect(form.state.values.value).toEqual({ foo: 'bar' })
      })
    })

    describe('fields', () => {
      test('focuses on form element for single, valid HTML element ref', () => {
        const formControl = new FormControl()

        const name = 'Elysia'

        const ref = document.createElement('input')

        const form = document.createElement('form')
        form.reset = vi.fn()

        document.body.appendChild(form)
        form.appendChild(ref)

        formControl.names.mount.add(name)

        formControl.fields[name] = {
          _f: {
            name,
            ref,
          },
        }

        formControl.reset()

        expect(form.reset).toHaveBeenCalled()
      })

      test('does not focus on form element for single, valid non-HTML element ref', () => {
        const formControl = new FormControl()

        const name = 'Elysia'

        const form = document.createElement('form')
        form.reset = vi.fn()

        document.body.appendChild(form)

        formControl.names.mount.add(name)

        formControl.fields[name] = {
          _f: {
            name,
            ref: { name },
          },
        }

        formControl.reset()

        expect(form.reset).not.toHaveBeenCalled()
      })

      test('does not focus if no mounted names map to existing fields', () => {
        const formControl = new FormControl()

        const name = 'Elysia'

        const form = document.createElement('form')
        form.reset = vi.fn()

        document.body.appendChild(form)

        formControl.names.mount.add(name)

        formControl.reset()

        expect(form.reset).not.toHaveBeenCalled()
      })

      test('uses the first ref if refs array is defined', () => {
        const formControl = new FormControl()

        const name = 'Elysia'

        const ref = document.createElement('input')

        const form = document.createElement('form')
        form.reset = vi.fn()

        document.body.appendChild(form)
        form.appendChild(ref)

        formControl.names.mount.add(name)

        formControl.fields[name] = {
          _f: {
            name,
            // Normally, this would be ignored since it isn't an HTML element (see the other test).
            // However, since refs is an array, it will use the first ref, which IS an HTML element.
            ref: { name },
            refs: [ref],
          },
        }

        formControl.reset()

        expect(form.reset).toHaveBeenCalled()
      })
    })

    describe('keepDirtyValues', () => {
      test('clean fields inherit default values', () => {
        const name = 'a'
        const defaultValues = { [name]: 'b' }
        const formControl = new FormControl()

        formControl.names.mount.add(name)
        formControl.state.defaultValues.set(defaultValues)

        expect(formControl.state.values.value).toEqual({})

        formControl.reset(undefined, { keepDirtyValues: true })

        expect(formControl.state.values.value).toEqual(defaultValues)
      })

      test('clean fields inherit default values works with root option to keepDirtyValues', () => {
        const name = 'a'
        const defaultValues = { [name]: 'b' }
        const formControl = new FormControl({ resetOptions: { keepDirtyValues: true } })

        formControl.names.mount.add(name)
        formControl.state.defaultValues.set(defaultValues)

        expect(formControl.state.values.value).toEqual({})

        formControl.reset()

        expect(formControl.state.values.value).toEqual(defaultValues)
      })

      test('dirtyFields keep their current values', () => {
        const name = 'a'
        const defaultValues = { [name]: 'b' }
        const formControl = new FormControl()

        formControl.names.mount.add(name)
        formControl.state.defaultValues.set(defaultValues)
        formControl.state.dirtyFields.set({ [name]: true })

        expect(formControl.state.values.value).toEqual({})

        formControl.reset(undefined, { keepDirtyValues: true })

        expect(formControl.state.values.value).toEqual({ [name]: undefined })
      })
    })
  })
})
