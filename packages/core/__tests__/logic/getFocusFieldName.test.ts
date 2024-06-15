import { describe, it, expect } from 'vitest'

import getFocusFieldName from '../../src/logic/fields/get-focus-field-name'

describe('getFocusFieldName', () => {
  it('should return expected focus name', () => {
    expect(getFocusFieldName('test', 0, { shouldFocus: false })).toEqual('')
    expect(getFocusFieldName('test', 0, { shouldFocus: true, focusName: 'test' })).toEqual('test')
    expect(getFocusFieldName('test', 0, { shouldFocus: true, focusIndex: 1 })).toEqual('test.1.')
    expect(getFocusFieldName('test', 0)).toEqual('test.0.')
  })
})
