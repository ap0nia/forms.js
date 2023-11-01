import { describe, test, expect } from 'vitest'

import { fieldIsEmpty } from '../../../src/logic/fields/field-is-empty'
import type { Field } from '../../../src/types/fields'

describe('fieldIsEmpty', () => {
  test('returns true for file input if all values are null', () => {
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

    expect(fieldIsEmpty(field, null)).toBeTruthy()
  })

  test('returns false for file input if FieldReference value is not null', () => {
    const field: Field = {
      _f: {
        name: 'test',
        ref: {
          name: 'test',
          type: 'file',
        },
        value: 'non-null value',
      },
    }

    expect(fieldIsEmpty(field, null)).toBeFalsy()
  })

  test('returns false for file input if provided input value is not null', () => {
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

    expect(fieldIsEmpty(field, 'non-null input value')).toBeFalsy()
  })

  test('returns true for regular input if provided value is empty', () => {
    const field: Field = {
      _f: {
        name: 'test',
        ref: document.createElement('input'),
        value: 'non-empty field value',
      },
    }

    expect(fieldIsEmpty(field, '')).toBeTruthy()
  })

  test('returns true for regular input if FieldReference value is empty', () => {
    const field: Field = {
      _f: {
        name: 'test',
        ref: document.createElement('input'),
        value: '',
      },
    }

    expect(fieldIsEmpty(field, 'non-empty input value')).toBeTruthy()
  })

  test('returns true for empty array', () => {
    const field: Field = {
      _f: {
        name: 'test',
        ref: {
          name: 'test',
        },
        value: 'non-empty field value',
      },
    }

    expect(fieldIsEmpty(field, [])).toBeTruthy()
  })

  test('returns false for non-empty array', () => {
    const field: Field = {
      _f: {
        name: 'test',
        ref: {
          name: 'test',
        },
        value: 'non-empty field value',
      },
    }

    expect(fieldIsEmpty(field, ['non-empty input value'])).toBeFalsy()
  })
})
