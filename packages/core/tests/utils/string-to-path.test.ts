import { describe, test, expect } from 'vitest'

import { stringToPath } from '../../src/utils/string-to-path'

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/utils/stringToPath.test.ts
 */
describe('stringToPath', () => {
  test('should convert string to path', () => {
    expect(stringToPath('test')).toEqual(['test'])

    expect(stringToPath('[test]]')).toEqual(['test'])

    expect(stringToPath('test.test[2].data')).toEqual(['test', 'test', '2', 'data'])

    expect(stringToPath('test.test["2"].data')).toEqual(['test', 'test', '2', 'data'])

    expect(stringToPath("test.test['test'].data")).toEqual(['test', 'test', 'test', 'data'])

    expect(stringToPath('test.test.2.data')).toEqual(['test', 'test', '2', 'data'])
  })
})
