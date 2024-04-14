import { describe, it, expect } from 'vitest'

import { noop } from '../../src/utils/noop'

describe('noop', () => {
  it('should be a function', () => {
    expect(noop instanceof Function).toBeTruthy()
  })

  it('should return undefined', () => {
    const result = noop()

    expect(result).toBeUndefined()
  })
})
