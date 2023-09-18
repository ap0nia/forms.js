/**
 * @vitest-environment jsdom
 */

import { describe, test, expect } from 'vitest'

import { isHTMLElement } from '../../../src/logic/html/is-html-element'

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/utils/isHTMLElement.test.ts
 */
describe('isHTMLElement', () => {
  test('returns true for HTMLElement', () => {
    expect(isHTMLElement(document.createElement('input'))).toBeTruthy()
  })

  test('returns true for HTMLElement inside an iframe', () => {
    const iframe = document.createElement('iframe')

    document.body.append(iframe)

    const iframeDocument = iframe.contentDocument!

    const input = iframeDocument.createElement('input')

    iframeDocument.body.append(input)

    expect(isHTMLElement(input)).toBeTruthy()
  })

  test('returns false for undefined', () => {
    expect(isHTMLElement(undefined)).toBeFalsy()
  })
})
