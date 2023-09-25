import { describe, test, expect, vi } from 'vitest'

import { setCustomValidity } from '../../../src/logic/html/set-custom-validity'

describe('setCustomValidity', () => {
  test('calls set custom validity and report validity with string message', () => {
    const ref = {
      setCustomValidity: vi.fn(),
      reportValidity: vi.fn(),
    }

    setCustomValidity(ref as any, 'test')

    expect(ref.setCustomValidity).toBeCalledWith('test')
    expect(ref.reportValidity).toBeCalled()
  })

  test('calls set custom validity and report validity empty string for boolean message', () => {
    const ref = {
      setCustomValidity: vi.fn(),
      reportValidity: vi.fn(),
    }

    setCustomValidity(ref as any, true)

    expect(ref.setCustomValidity).toBeCalledWith('')
    expect(ref.reportValidity).toBeCalled()
  })

  test('calls set custom validity and report validity empty string for undefined message', () => {
    const ref = {
      setCustomValidity: vi.fn(),
      reportValidity: vi.fn(),
    }

    setCustomValidity(ref as any)

    expect(ref.setCustomValidity).toBeCalledWith('')
    expect(ref.reportValidity).toBeCalled()
  })
})
