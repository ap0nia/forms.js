import { waitFor, screen } from '@testing-library/dom'
import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('setFieldValue', () => {
    test('setting value for existing, disabled field does not mutate the form values', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.fields[name] = {
        _f: {
          name,
          ref: { name },
          disabled: true,
        },
      }

      formControl.setFieldValue(name, 'Hello', { shouldValidate: true })

      expect(formControl.values.value).toEqual({})
    })

    test('setting value for existing, enabled field mutates the form values', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.fields[name] = {
        _f: {
          name,
          ref: { name },
        },
      }

      formControl.setFieldValue(name, 'Hello')

      expect(formControl.values.value).toEqual({ [name]: 'Hello' })
    })

    test('setting a new field name does not change values', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.setFieldValue(name, null)

      expect(formControl.values.value).toEqual({})
    })

    test('setting a new field name updates touched and dirty', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.setFieldValue(name, null, { shouldDirty: true, shouldTouch: true })

      expect(formControl.state.touchedFields.value).toEqual({
        [name]: true,
      })

      expect(formControl.state.dirtyFields.value).toEqual({
        [name]: true,
      })
    })

    test('setting a null value for an html element changes the field value to empty string', () => {
      const formControl = new FormControl()

      const name = 'name'

      const ref = document.createElement('input')

      formControl.fields[name] = {
        _f: {
          name,
          ref,
        },
      }

      formControl.setFieldValue(name, null)

      expect(ref.value).toEqual('')
    })

    test('changed value is visible in the DOM', async () => {
      const formControl = new FormControl()

      const name = 'name'

      const ref = document.createElement('input')

      document.body.appendChild(ref)

      formControl.fields[name] = {
        _f: {
          name,
          ref,
        },
      }

      expect(ref.value).toEqual('')

      const value = 'I love Elysia'

      formControl.setFieldValue(name, value)

      await waitFor(() => expect(screen.getByDisplayValue(value)).toBeTruthy())

      document.body.innerHTML = ''
    })
  })
})
