import { describe, test, expect } from 'vitest'

import type { Field } from '../../src/logic/fields'
import { fieldRefIsEmpty } from '../../src/utils/field-ref-is-empty'

describe('fieldRefIsEmpty', () => {
  test('empty file input', () => {
    const field: Field = {
      _f: {
        name: 'file',
        ref: {
          name: 'file',
          type: 'file',
        },
        value: null,
      },
    }

    expect(fieldRefIsEmpty(field, null)).toEqual(true)
  })

  test('html input element with empty value', () => {
    const ref = document.createElement('input')

    const field: Field = {
      _f: {
        name: 'text',
        ref,
        value: '',
      },
    }

    expect(fieldRefIsEmpty(field, null)).toEqual(true)
  })

  test('empty array is empty', () => {
    const field: Field = {
      _f: {
        name: 'array',
        ref: {
          name: 'array',
          type: 'text',
        },
        value: null,
      },
    }

    expect(fieldRefIsEmpty(field, [])).toEqual(true)
  })
})
