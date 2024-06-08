import { describe, it, expect } from 'vitest'

import { getCheckBoxValue } from '../../src/logic/html/checkbox'

describe('getCheckboxValue', () => {
  it('should return default value if not valid or empty options', () => {
    expect(getCheckBoxValue(undefined)).toEqual({
      value: false,
      isValid: false,
    })
  })

  it('should return checked value if single checkbox is checked', () => {
    expect(
      getCheckBoxValue([
        {
          name: 'bill',
          checked: true,
          value: '3',
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: { value: '3' },
        },
      ]),
    ).toEqual({ value: '3', isValid: true })
  })

  it('should return true if single checkbox is checked and has no value', () => {
    expect(
      // @ts-expect-error Invalid NamedNodeMap.
      getCheckBoxValue([{ name: 'bill', checked: true, attributes: {} }]),
    ).toEqual({ value: true, isValid: true })
  })

  it('should return true if single checkbox is checked and has empty value', () => {
    expect(
      getCheckBoxValue([
        {
          name: 'bill',
          checked: true,
          value: '',
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: { value: 'test' },
        },
      ]),
    ).toEqual({ value: true, isValid: true })
    expect(
      getCheckBoxValue([
        {
          name: 'bill',
          checked: true,
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: { value: 'test' },
        },
      ]),
    ).toEqual({ value: true, isValid: true })
  })

  it('should return false if single checkbox is un-checked', () => {
    expect(
      getCheckBoxValue([
        {
          name: 'bill',
          checked: false,
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: {},
        },
      ]),
    ).toEqual({ value: false, isValid: false })
  })

  it('should return multiple selected values', () => {
    expect(
      getCheckBoxValue([
        {
          name: 'bill',
          checked: true,
          value: '2',
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: { value: '2' },
        },
        {
          name: 'bill',
          checked: true,
          value: '3',
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: { value: '3' },
        },
      ]),
    ).toEqual({ value: ['2', '3'], isValid: true })
  })

  it('should return values for checked boxes only', () => {
    expect(
      getCheckBoxValue([
        {
          name: 'bill',
          checked: false,
          value: '2',
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: { value: '2' },
        },
        {
          name: 'bill',
          checked: true,
          value: '3',
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: { value: '3' },
        },
        {
          name: 'bill',
          checked: false,
          value: '4',
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: { value: '4' },
        },
      ]),
    ).toEqual({ value: ['3'], isValid: true })
  })

  it('should return empty array for multi checkbox with no checked box', () => {
    expect(
      getCheckBoxValue([
        {
          name: 'bill',
          checked: false,
          value: '2',
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: { value: '2' },
        },
        {
          name: 'bill',
          checked: false,
          value: '3',
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: { value: '3' },
        },
      ]),
    ).toEqual({ value: [], isValid: false })
  })

  it('should not return error when check box ref is undefined', () => {
    expect(
      getCheckBoxValue([
        // @ts-expect-error Invalid NamedNodeMap.
        undefined,
        {
          name: 'bill',
          checked: false,
          value: '2',
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: { value: '2' },
        },
      ]),
    ).toEqual({ value: [], isValid: false })
  })

  it('should return disabled input result', () => {
    expect(
      getCheckBoxValue([
        {
          name: 'bill',
          checked: true,
          value: '2',
          disabled: true,
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: { value: '2' },
        },
        {
          name: 'bill',
          checked: true,
          value: '3',
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: { value: '3' },
        },
      ]),
    ).toEqual({
      value: ['3'],
      isValid: true,
    })

    expect(
      getCheckBoxValue([
        {
          name: 'bill',
          checked: true,
          value: '2',
          disabled: true,
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: { value: '2' },
        },
        {
          name: 'bill',
          disabled: true,
          checked: true,
          value: '3',
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: { value: '3' },
        },
      ]),
    ).toEqual({
      value: [],
      isValid: false,
    })

    expect(
      getCheckBoxValue([
        {
          name: 'bill',
          checked: true,
          value: '2',
          disabled: true,
          // @ts-expect-error Invalid NamedNodeMap.
          attributes: { value: '2' },
        },
      ]),
    ).toEqual({
      value: false,
      isValid: false,
    })
  })
})
