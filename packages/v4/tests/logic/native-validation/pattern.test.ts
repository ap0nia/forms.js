import { describe, test, expect, vi } from 'vitest'

import { nativeValidatePattern } from '../../../src/logic/native-validation/pattern'
import type { NativeValidationContext } from '../../../src/logic/native-validation/types'

describe('nativeValidatePattern', () => {
  const defaultContext: NativeValidationContext = {
    field: {
      _f: {
        name: 'test',
        pattern: /validTestValue/,
        ref: {
          name: 'test',
        },
      },
    },
    errors: {},
    inputRef: document.createElement('input'),
    inputValue: 'invalid test value',
    formValues: {},
    shouldSetCustomValidity: true,
  }

  test('set custom validity is called', () => {
    const setCustomValidity = vi.fn()
    const reportValidity = vi.fn()

    const context: NativeValidationContext = {
      ...defaultContext,
      inputRef: {
        setCustomValidity,
        reportValidity,
      } as any,
      shouldSetCustomValidity: true,
    }

    nativeValidatePattern(context)

    expect(setCustomValidity).toHaveBeenCalledOnce()
  })
})
