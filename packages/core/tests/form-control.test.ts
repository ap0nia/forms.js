import { describe, test, expect } from 'vitest'

import { FormControl } from '../src/form-control'

describe('create-form-control', () => {
  describe('get values', () => {
    test('no values', () => {
      const formControl = new FormControl()
      expect(formControl.getValues()).toEqual({})
    })

    const values = {
      name: 'Elysia',
      age: 18,
      a: {
        b: {
          c: {
            d: 'Hello',
          },
        },
      },
    }

    test('values but unregister', () => {
      const formControl = new FormControl({ values, shouldUnregister: true })
      expect(formControl.getValues()).toEqual({})
    })

    describe('set values', () => {
      test('no key', () => {
        const formControl = new FormControl({ values })
        expect(formControl.getValues()).toEqual(values)
      })

      test('single key', () => {
        const formControl = new FormControl({ values })
        expect(formControl.getValues('a')).toEqual(values.a)
      })

      test('args keys', () => {
        const formControl = new FormControl({ values })
        expect(formControl.getValues('a', 'name', 'a.b.c')).toEqual([
          values.a,
          values.name,
          values.a.b.c,
        ])
      })

      test('array keys', () => {
        const formControl = new FormControl({ values })
        expect(formControl.getValues(['a.b.c.d', 'name'])).toEqual([values.a.b.c.d, values.name])
      })
    })
  })

  describe('register', () => {
    const values = {
      name: 'Elysia',
      age: 18,
      friends: ['Aponia', 'Eden'],
    }

    test('fields are changed', () => {
      const formControl = new FormControl({ values })

      formControl.register('friends')

      expect(formControl.fields['friends']).toBeDefined()
    })

    test('repeat register creates super-set of fields', () => {
      const formControl = new FormControl({ values })

      formControl.register('friends')

      const previousFields = formControl.fields

      formControl.register('friends')

      const afterFields = formControl.fields

      expect(afterFields).toBe(previousFields)
    })

    test('field name is added to mount set after registering', () => {
      const formControl = new FormControl({})

      formControl.register('friends')

      expect(formControl.names.mount.has('friends')).toBeTruthy()
    })

    test('non-null value provided', () => {
      const formControl = new FormControl({})

      formControl.register('friends')

      expect(
        formControl.updateValidAndValue('friends', false, 'not null', {
          name: 'friends',
          defaultChecked: true,
        }),
      ).toBeFalsy()
    })

    test('no return if field does not exist', () => {
      const formControl = new FormControl({ values })

      expect(formControl.updateValidAndValue('', false)).toBeFalsy()
    })
  })
})
