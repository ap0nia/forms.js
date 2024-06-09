import { describe, it, expect } from 'vitest'

import generateId from '../../src/utils/generate-id'

describe('generateId', () => {
  it('should generate a unique id', () => {
    expect(/\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}/i.test(generateId())).toBeTruthy()
  })

  it('should fallback to current date if performance is undefined', () => {
    Object.defineProperty(window, 'performance', {
      value: undefined,
    })

    expect(/\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}/i.test(generateId())).toBeTruthy()
  })
})
