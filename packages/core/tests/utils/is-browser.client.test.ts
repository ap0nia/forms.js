/**
 * @vitest-environment jsdom
 */

import { describe, test, expect } from 'vitest'

import { isBrowser } from '../../src/utils/is-browser'

describe('isBrowser', () => {
  test('returns true in jsdom test environment', () => {
    expect(isBrowser()).toBe(true)
  })
})
