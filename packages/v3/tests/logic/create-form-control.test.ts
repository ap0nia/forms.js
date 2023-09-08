import { describe, test } from 'vitest'

import { createFormControl } from '../../src/logic/create-form-control'

describe('create form control', () => {
  test('should return getValues', () => {
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

    const formControl = createFormControl<MyForm>()

    console.log(formControl)

    formControl.register('a.b.c.d')

    console.log(JSON.stringify(formControl.fields, null, 2))
  })
})
