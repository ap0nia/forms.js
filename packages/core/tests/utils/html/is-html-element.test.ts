/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/utils/isHTMLElement.test.ts
 */

import { describe, it, expect } from 'vitest'

import { isHTMLElement } from '../../../src/utils/html/is-html-element'

describe('isHTMLElement', () => {
  it('should return true when value is HTMLElement', () => {
    expect(isHTMLElement(document.createElement('input'))).toBeTruthy()
  })

  it('should return true when HTMLElement is inside an iframe', () => {
    const iframe = document.createElement('iframe')

    document.body.append(iframe)

    const iframeDocument = iframe.contentDocument!

    const input = iframeDocument.createElement('input')

    iframeDocument.body.append(input)

    expect(isHTMLElement(input)).toBeTruthy()
  })

  it('should return false for nullish values', () => {
    expect(isHTMLElement(null)).toBeFalsy()
    expect(isHTMLElement(undefined)).toBeFalsy()
  })

  it('should return false immediately if window is undefined', () => {
    const originalWindow = global.window

    global.window = undefined as any

    expect(isHTMLElement(document.createElement('input'))).toBeFalsy()

    global.window = originalWindow
  })
})
