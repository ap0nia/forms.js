import { Blob } from 'node:buffer'

import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('setValue', () => {
    test('fills in nested field', () => {
      const ref = document.createElement('input')

      const formControl = new FormControl()

      const name0 = 'abc'
      const name1 = 'def'

      formControl.fields[name0] = {
        [name1]: {
          _f: {
            name: ref.name,
            ref,
          },
        },
      }

      const value = 'Elysia'

      formControl.setValue(name0, { [name1]: value })

      expect(ref.value).toEqual(value)

      expect(formControl.values.value).toEqual({
        [name0]: {
          [name1]: value,
        },
      })
    })

    test('field array updates dirty states if there are subscribers', () => {
      const ref = document.createElement('input')

      const formControl = new FormControl()

      const subscriber = vi.fn()

      const unsubscribe = formControl.state.dirtyFields.subscribe(subscriber)

      const name = 'abc'

      formControl.names.array.add(name)

      formControl.fields[name] = {
        _f: {
          name: ref.name,
          ref,
        },
      }

      formControl.setValue(name, 'Elysia', { shouldDirty: true })

      expect(formControl.state.isDirty.value).toBeTruthy()

      unsubscribe()
    })
  })

  describe('setValue, react-hook-form', () => {
    test('sets element value to empty string for HTML element ref if value is nullish', () => {
      const ref = document.createElement('input')

      const originalValue = 'hello'

      ref.value = originalValue

      expect(ref.value).toEqual(originalValue)

      const formControl = new FormControl()

      const name = 'test'

      formControl.fields[name] = {
        _f: {
          name: ref.name,
          ref,
        },
      }

      formControl.setValue(name, null)

      expect(ref.value).toEqual('')
    })

    test('sets value of file input correctly if value is FileList', async () => {
      const blob = new Blob([''], { type: 'image/png' })

      const file: File = blob as any

      const fileList: FileList = {
        0: file,
        1: file,
        length: 2,
      } as any

      const ref = document.createElement('input')

      const formControl = new FormControl()

      const name = 'test'

      formControl.fields[name] = {
        _f: {
          name: ref.name,
          ref,
        },
      }

      // Should not have any value at first.
      expect(ref.value).toEqual('')

      formControl.setValue(name, fileList)

      // Attempts to set the `value` property since the input type is not 'file'
      // Since it's an HTML element, it will be coerced to a string.
      expect(ref.value).toEqual('' + fileList)

      // ref.files can't be set directly, but the FileList value will be captured in the form.
      expect(formControl.values.value).toEqual({ [name]: fileList })
    })
  })
})
