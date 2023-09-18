import { describe, test, expect } from 'vitest'

import type { Field } from '../../../src/logic/fields'
import { fieldIsEmpty } from '../../../src/logic/helpers/field-is-empty'

describe('fieldIsEmpty', () => {
  test('true for empty file input', () => {
    const field: Field = {
      _f: {
        name: 'test',
        ref: {
          name: 'test',
          type: 'file',
        },
        value: null,
      },
    }

    expect(fieldIsEmpty(field, null)).toBe(true)
  })

  test('true for empty input value', () => {
    const field: Field = {
      _f: {
        name: 'test',
        ref: {
          name: 'test',
          type: 'text',
        },
        value: 'non-empty field value',
      },
    }

    expect(fieldIsEmpty(field, '')).toBeTruthy()
  })

  test('true for empty field value', () => {
    const field: Field = {
      _f: {
        name: 'test',
        ref: document.createElement('input'),
        value: '',
      },
    }

    expect(fieldIsEmpty(field, 'non-empty input value')).toBeTruthy()
  })

  test('true for empty array', () => {
    const field: Field = {
      _f: {
        name: 'test',
        ref: document.createElement('input'),
        value: 'non-empty field value',
      },
    }

    expect(fieldIsEmpty(field, [])).toBeTruthy()
  })
})
