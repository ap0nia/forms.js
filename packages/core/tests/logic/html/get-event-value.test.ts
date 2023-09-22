import { describe, test, expect } from 'vitest'

import { getEventValue } from '../../../src/logic/html/get-event-value'

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/logic/getEventValue.test.ts
 */
describe('getEventValue', () => {
  test('getEventValue should return correct value', () => {
    expect(
      getEventValue({
        target: { checked: true, type: 'checkbox' },
      }),
    ).toEqual(true)

    expect(
      getEventValue({
        target: { checked: true, type: 'checkbox', value: 'test' },
      }),
    ).toEqual(true)

    expect(getEventValue({ target: { value: 'test' }, type: 'test' })).toEqual('test')

    expect(getEventValue({ data: 'test' })).toEqual({ data: 'test' })

    expect(getEventValue('test')).toEqual('test')

    expect(getEventValue(undefined)).toEqual(undefined)

    expect(getEventValue(null)).toEqual(null)
  })
})
