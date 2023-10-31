/**
 * @vitest-environment node
 */

import { describe, test, expect } from 'vitest'

import { isBrowser } from '../../src/utils/is-browser'

describe('isBrowser', () => {
  test('returns false in node test environment', () => {
    expect(isBrowser()).toBeFalsy()
  })
})
