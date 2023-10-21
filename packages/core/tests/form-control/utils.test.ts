import { RecordDerived } from '@forms.js/common/store'
import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('utilities', () => {
    describe('isTracking', () => {
      test('returns true if derived state is directly tracking', () => {
        const formControl = new FormControl()

        formControl.derivedState.proxy.isDirty

        expect(formControl.isTracking('isDirty')).toBeTruthy()
      })

      test('returns true if derived state clone is tracking', () => {
        const formControl = new FormControl()

        const clone = new RecordDerived(formControl.state)

        clone.proxy.isDirty

        formControl.derivedState.clones.add(clone)

        expect(clone.isTracking('isDirty')).toBeTruthy()
      })

      test('returns true if a direct subscriber is tracking', () => {
        const formControl = new FormControl()

        formControl.state.isDirty.subscribe(() => {})

        expect(formControl.isTracking('isDirty')).toBeTruthy()
      })
    })
  })
})
