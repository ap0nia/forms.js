import { describe, test, expect, vi } from 'vitest'

import { focusFieldBy } from '../../../src/logic/helpers/focus-field-by'
import { safeGet } from '../../../src/utils/safe-get'

describe('focusFieldBy', () => {
  test('focuss the first error encountered', () => {
    const focus = vi.fn()

    focusFieldBy(
      {
        test: {
          _f: {
            name: 'test',
            ref: {
              name: 'test',
              focus,
            },
          },
        },
      },
      (key) =>
        safeGet(
          {
            test: {
              message: 'test',
              type: 'required',
            },
          },
          String(key),
        ),
    )

    expect(focus).toBeCalled()
  })

  test('focuss first option when options input error encounters', () => {
    const focus = vi.fn()

    const input = document.createElement('input')

    input.focus = focus

    focusFieldBy(
      {
        test: {
          _f: {
            name: 'test',
            ref: {
              name: 'test',
            },
            refs: [input],
          },
        },
      },
      (key) =>
        safeGet(
          {
            test: {
              message: 'test',
              type: 'required',
            },
          },
          String(key),
        ),
    )

    expect(focus).toBeCalled()
  })

  test('does not call focus when field is undefined', () => {
    expect(() => {
      focusFieldBy(
        {
          test: undefined,
        },
        (key) =>
          safeGet(
            {
              test: {
                message: 'test',
                type: 'required',
              },
            },
            String(key),
          ),
      )
    }).not.toThrow()
  })

  test('nested object', () => {
    const focus = vi.fn()

    focusFieldBy(
      {
        test: {
          nested: {
            _f: {
              name: 'test',
              ref: {
                name: 'test',
                focus,
              },
            },
          },
        },
      },
      (key) =>
        safeGet(
          {
            test: {
              message: 'test',
              type: 'required',
            },
          },
          String(key),
        ),
    )

    expect(focus).toBeCalled()
  })
})