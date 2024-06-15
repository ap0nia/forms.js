import { describe, it, expect } from 'vitest'

import { stringToPath } from '../../src/utils/string-to-path'

describe('stringToPath', () => {
  it('should convert string to path', () => {
    expect(stringToPath('test')).toEqual(['test'])

    expect(stringToPath('[test]]')).toEqual(['test'])

    expect(stringToPath('test.test[2].data')).toEqual(['test', 'test', '2', 'data'])

    expect(stringToPath('test.test["2"].data')).toEqual(['test', 'test', '2', 'data'])

    expect(stringToPath("test.test['test'].data")).toEqual(['test', 'test', 'test', 'data'])

    expect(stringToPath('test.test.2.data')).toEqual(['test', 'test', '2', 'data'])
  })
})
