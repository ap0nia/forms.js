import { describe, test, expect } from 'vitest'

import { getRefFromElement } from '../../../src/logic/html/get-ref-from-element'

describe('getRefFromElement', () => {
  test('returns the original element if value is null', () => {
    const element = document.createElement('input')

    element.value = null as any

    expect(getRefFromElement(element)).toBe(element)
  })

  test('returns original element if querySelectorAll is not a method', () => {
    const element = document.createElement('input')

    delete (element as any).querySelectorAll

    expect(getRefFromElement(element)).toBe(element)
  })

  test('the element with querySelectorAll', () => {
    const input = document.createElement('input')

    expect(getRefFromElement(input)).toBe(input)
  })

  test('returns the original element if the element is not an input element', () => {
    const element = document.createElement('div')

    expect(getRefFromElement(element as any)).toBe(element)
  })
})
