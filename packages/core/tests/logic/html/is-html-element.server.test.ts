/**
 * @vitest-environment node
 */

import { describe, test, expect } from 'vitest'

import { isHTMLElement } from '../../../src/logic/html/is-html-element'

describe('isHTMLElement', () => {
  test('returns false if not browser', () => {
    expect(isHTMLElement({})).toBeFalsy()
  })
})
