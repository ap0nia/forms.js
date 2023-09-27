import { describe, test, expect } from 'vitest'

import { updateFieldReference } from '../../../src/logic/fields/update-field-reference'
import type { FieldReference } from '../../../src/types/fields'

describe('update field reference', () => {
  describe('multiple select input', () => {
    test('should update all multi-select options', () => {
      const reference = {
        name: 'test',
        ref: {
          name: 'test',
          type: 'select-multiple',
          options: [
            { value: 'value-a', selected: false },
            { value: 'value-b', selected: false },
            { value: 'value-c', selected: false },
            { value: 'd', selected: false },
            { value: 'e', selected: false },
            { value: 'f', selected: false },
          ] as any,
        },
      } satisfies FieldReference

      const value = ['value-a', 'value-b', 'value-c']

      expect(updateFieldReference(reference, value)).toBe('select')

      expect(reference.ref.options[0].selected).toBeTruthy()
      expect(reference.ref.options[1].selected).toBeTruthy()
      expect(reference.ref.options[2].selected).toBeTruthy()
      expect(reference.ref.options[3].selected).toBeFalsy()
      expect(reference.ref.options[4].selected).toBeFalsy()
      expect(reference.ref.options[5].selected).toBeFalsy()
    })
  })

  describe('checkbox input', () => {
    test('should not do anything for no checkboxes', () => {
      const reference = {
        name: 'test',
        ref: {
          name: 'test',
          type: 'checkbox',
          checked: false,
        },
        refs: [],
      } satisfies FieldReference

      const value = 'value-a'

      expect(updateFieldReference(reference, value)).toBe('checkbox')

      expect(reference.ref.checked).toBeFalsy()
    })

    test('should update single checkbox option', () => {
      const reference = {
        name: 'test',
        ref: {
          name: 'test',
          type: 'checkbox',
          checked: false,
        },
        refs: [{ name: 'test', type: 'checkbox', value: 'value-a', checked: false }] as any,
      } satisfies FieldReference

      const value = 'value-a'

      expect(updateFieldReference(reference, value)).toBe('checkbox')

      expect(reference.refs[0].checked).toBeTruthy()
    })

    test('should update correct checkbox option with single value', () => {
      const reference = {
        name: 'test',
        ref: {
          name: 'test',
          type: 'checkbox',
          checked: false,
        },
        refs: [
          { name: 'test', type: 'checkbox', value: 'a', checked: false, defaultChecked: true },
          { name: 'test', type: 'checkbox', value: 'a', checked: false },
        ] as any,
      } satisfies FieldReference

      const value = 'a'

      expect(updateFieldReference(reference, value)).toBe('checkbox')

      expect(reference.refs[1].checked).toBeTruthy()
    })

    test('update multiple checkbox options', () => {
      const reference = {
        name: 'test',
        ref: {
          name: 'test',
          type: 'checkbox',
          checked: false,
        },
        refs: [
          { name: 'test', type: 'checkbox', value: 'value-a', checked: false },
          { name: 'test', type: 'checkbox', value: 'value-b', checked: false },
          { name: 'test', type: 'checkbox', value: 'value-c', checked: false },
          { name: 'test', type: 'checkbox', value: 'd', checked: false },
          { name: 'test', type: 'checkbox', value: 'e', checked: false },
          { name: 'test', type: 'checkbox', value: 'f', checked: false },
        ] as any,
      } satisfies FieldReference

      const value = ['value-a', 'value-b', 'value-c']

      expect(updateFieldReference(reference, value)).toBe('checkbox')

      expect(reference.refs[0].checked).toBeTruthy()
      expect(reference.refs[1].checked).toBeTruthy()
      expect(reference.refs[2].checked).toBeTruthy()
      expect(reference.refs[3].checked).toBeFalsy()
      expect(reference.refs[4].checked).toBeFalsy()
      expect(reference.refs[5].checked).toBeFalsy()
    })
  })

  describe('radio input', () => {
    test('should update all radio options', () => {
      const reference = {
        name: 'test',
        ref: {
          name: 'test',
          type: 'radio',
          checked: false,
        },
        refs: [
          { name: 'test', type: 'radio', value: 'value-a', checked: false },
          { name: 'test', type: 'radio', value: 'value-b', checked: false },
          { name: 'test', type: 'radio', value: 'value-c', checked: false },
          { name: 'test', type: 'radio', value: 'd', checked: false },
          { name: 'test', type: 'radio', value: 'e', checked: false },
          { name: 'test', type: 'radio', value: 'f', checked: false },
        ] as any,
      } satisfies FieldReference

      const value = 'value-a'

      expect(updateFieldReference(reference, value)).toBe('radio')

      expect(reference.refs[0].checked).toBeTruthy()
      expect(reference.refs[1].checked).toBeFalsy()
      expect(reference.refs[2].checked).toBeFalsy()
      expect(reference.refs[3].checked).toBeFalsy()
      expect(reference.refs[4].checked).toBeFalsy()
      expect(reference.refs[5].checked).toBeFalsy()
    })
  })

  describe('file input', () => {
    test('should update file input value', () => {
      const reference = {
        name: 'test',
        ref: {
          name: 'test',
          type: 'file',
          value: '',
        },
      } satisfies FieldReference

      const value = 'file'

      expect(updateFieldReference(reference, value)).toBe('file')

      expect(reference.ref.value).toBe('')
    })
  })

  describe('custom input', () => {
    test('should update custom input value', () => {
      const reference = {
        name: 'test',
        ref: {
          name: 'test',
          type: 'text',
          value: '',
        },
      } satisfies FieldReference

      const value = 'text'

      expect(updateFieldReference(reference, value)).toBe('custom')

      expect(reference.ref.value).toBe('text')
    })
  })
})
