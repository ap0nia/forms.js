import { describe, test, expect } from 'vitest'

import { dummyRef, mergeElementWithField } from '../../../src/logic/html/merge-element-with-field'
import type { Field } from '../../../src/types/fields'

describe('mergeElementWithField', () => {
  test('returns same field if HTML element is already in a checkbox or radio field', () => {
    const element = document.createElement('input')
    element.type = 'checkbox'

    const name = 'name'

    const field = {
      _f: {
        name,
        ref: {
          name,
        },
        refs: [element],
      },
    } satisfies Field

    const newField = mergeElementWithField(name, field, element)

    expect(newField).toBe(field)
  })

  test('name and ref is overridden', () => {
    const ref = document.createElement('input')
    ref.type = 'text'

    const name = 'name'

    const newName = 'hello'

    const field = {
      _f: {
        name,
        ref: {
          name,
        },
      },
    } satisfies Field

    const newField = mergeElementWithField(newName, field, ref)

    const expectedField: Field = {
      _f: {
        ...field._f,
        name: newName,
        ref,
      },
    }

    expect(newField).toEqual(expectedField)
  })

  test('radio or checkbox field overrides ref with custom', () => {
    const element = document.createElement('input')
    element.type = 'checkbox'

    const name = 'name'

    const field = {
      _f: {
        name,
        ref: {
          name,
        },
      },
    } satisfies Field

    const newField = mergeElementWithField(name, field, element)

    const expectedField: Field = {
      _f: {
        ...field._f,
        ref: {
          name,
          type: element.type,
        },
        refs: [element],
      },
    }

    expect(newField).toEqual(expectedField)
  })

  /**
   * @see https://github.com/react-hook-form/react-hook-form/pull/7938
   */
  test('default values for radio or checkbox indicates that the field is an array', () => {
    const element = document.createElement('input')
    element.type = 'checkbox'

    const name = 'name'

    const field = {
      _f: {
        name,
        ref: {
          name,
        },
      },
    } satisfies Field

    const defaultValues = { [name]: [] }

    const newField = mergeElementWithField(name, field, element, defaultValues)

    const expectedField: Field = {
      _f: {
        ...field._f,
        ref: {
          name,
          type: element.type,
        },
        refs: [element, dummyRef],
      },
    }

    expect(newField).toEqual(expectedField)
  })
})
