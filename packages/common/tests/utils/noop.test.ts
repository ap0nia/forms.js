import { describe, test, expect } from 'vitest'

import { asyncNoop, noop } from '../../src/utils/noop'

describe('noop', () => {
  test('does nothing', async () => {
    expect(noop()).toBeUndefined()
    expect(await asyncNoop()).toBeUndefined()
  })
})
