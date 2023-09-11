import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/logic/create-form-control'

type MyForm = {
  name: string
  age: number
  a: {
    b: {
      c: {
        d: string
      }
    }
  }
}

describe('create form control', () => {
  test('register sets fields', () => {
    const formControl = new FormControl<MyForm>()

    formControl.register('name')
    formControl.register('a.b')
    formControl.register('a.b.c.d')

    const fields = {
      name: {
        _f: {
          ref: {
            name: 'name',
          },
          name: 'name',
          mount: true,
        },
      },
      a: {
        b: {
          _f: {
            ref: {
              name: 'a.b',
            },
            name: 'a.b',
            mount: true,
          },
          c: {
            d: {
              _f: {
                ref: {
                  name: 'a.b.c.d',
                },
                name: 'a.b.c.d',
                mount: true,
              },
            },
          },
        },
      },
    }

    expect(formControl.fields).toEqual(fields)
  })

  test('register updates names', () => {
    const formControl = new FormControl<MyForm>()

    formControl.register('age')

    expect(formControl.names.mount).toEqual(new Set(['age']))

    formControl.register('a.b')
    formControl.register('a.b.c.d')

    expect(formControl.names.mount).toEqual(new Set(['age', 'a.b', 'a.b.c.d']))
  })

  describe('get values', () => {
    const values: MyForm = {
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

    const formControl = new FormControl<MyForm>({ values })

    test('no key', () => {
      expect(formControl.getValues()).toEqual(values)
    })

    test('single key', () => {
      expect(formControl.getValues('a')).toEqual(values.a)
    })

    test('args keys', () => {
      expect(formControl.getValues('a', 'name', 'a.b.c')).toEqual([
        values.a,
        values.name,
        values.a.b.c,
      ])
    })

    test('array keys', () => {
      expect(formControl.getValues(['a.b.c.d', 'name'])).toEqual([values.a.b.c.d, values.name])
    })
  })
})
