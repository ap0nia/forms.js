import { noop } from '@forms.js/common/utils/noop'
import { describe, it, expect } from 'vitest'

import { getValidateError } from '../../src/logic/validation/native-validation/validate'

describe('getValidateError', () => {
  it('should return field error in correct format', () => {
    expect(
      getValidateError(
        'This is a required field',
        {
          name: 'test1',
          value: '',
        },
        'required',
      ),
    ).toEqual({
      type: 'required',
      message: 'This is a required field',
      ref: {
        name: 'test1',
        value: '',
      },
    })

    expect(
      getValidateError(
        false,
        {
          name: 'test1',
          value: '',
        },
        'required',
      ),
    ).toEqual({
      type: 'required',
      message: '',
      ref: {
        name: 'test1',
        value: '',
      },
    })
  })

  it('should return undefined when called with non string result', () => {
    expect(getValidateError(undefined, noop)).toBeUndefined()
  })
})
