/**
 * @vitest-environment jsdom
 */

import { describe, test, expect } from 'vitest'

import { isHTMLElement } from '../../src/utils/is-html-element'

describe('isHTMLElement', () => {
  test('returns false for nullish value', () => {
    expect(isHTMLElement(undefined)).toBeFalsy()
  })
})
