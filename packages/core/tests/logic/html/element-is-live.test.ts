import { describe, test, expect } from 'vitest'

import { elementIsLive } from '../../../src/logic/html/element-is-live'

describe('elementIsLive', () => {
  test('returns false if element is not an HTMLElement', () => {
    expect(elementIsLive({})).toBeFalsy()
  })

  test('returns false if element is not connected', () => {
    expect(elementIsLive(document.createElement('div'))).toBeFalsy()
  })

  test('returns true if element is connected', () => {
    const element = document.createElement('div')

    // An element is connected if it is inserted into the document.
    // e.g. by appending it to the document.body.
    document.body.appendChild(element)

    expect(elementIsLive(element)).toBeTruthy()
  })
})
