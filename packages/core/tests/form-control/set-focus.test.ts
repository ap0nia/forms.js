import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('setFocus', () => {
    test('does not do anything for non-existent field', () => {
      const formControl = new FormControl()

      const fn = vi.fn()

      formControl.fields['hello'] = {
        _f: {
          name: '',
          ref: { name: '', focus: fn },
        },
      }

      formControl.setFocus('test')

      expect(fn).not.toHaveBeenCalled()
    })

    test('invokes field focus on ref', () => {
      const formControl = new FormControl()

      const fn = vi.fn()

      const name = 'test'

      formControl.fields[name] = {
        _f: {
          name: '',
          ref: { name: '', focus: fn },
        },
      }

      formControl.setFocus(name)

      expect(fn).toHaveBeenCalled()
    })

    test('invokes field focus on first ref', () => {
      const formControl = new FormControl()

      const fn = vi.fn()

      const name = 'test'

      const ref = document.createElement('input')
      ref.focus = fn

      formControl.fields[name] = {
        _f: {
          name: '',
          ref: { name: '' },
          refs: [ref],
        },
      }

      formControl.setFocus(name)

      expect(fn).toHaveBeenCalled()
    })

    test('invokes field select on ref', () => {
      const formControl = new FormControl()

      const fn = vi.fn()

      const name = 'test'

      formControl.fields[name] = {
        _f: {
          name: '',
          ref: { name: '', select: fn },
        },
      }

      formControl.setFocus(name, { shouldSelect: true })

      expect(fn).toHaveBeenCalled()
    })
  })
})
