import { get } from '@forms.js/common/utils/get'
import { describe, test, expect, vi } from 'vitest'

import { focusFieldBy } from '../../../src/logic/fields/focus-field-by'

describe('focusFieldBy', () => {
  test('focuses the first error encountered', () => {
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
        get(
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

  test('focuses first option when options input error encounters', () => {
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
        get(
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
          get(
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

  test('focuses field in nested object', () => {
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
        get(
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
