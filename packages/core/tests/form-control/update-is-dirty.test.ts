import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormContol', () => {
  describe('updateIsDirty', () => {
    test('form state stays not dirty if nothing changed', () => {
      const formControl = new FormControl()

      formControl.updateIsDirty()

      expect(formControl.formState.isDirty).toBeFalsy()
    })

    test('form state becomes dirty after something changed', () => {
      const formControl = new FormControl({ defaultValues: { name: 'Elysia' } })

      formControl.values.name = 'Aponia'

      // Should not change prior to updating.
      expect(formControl.formState.isDirty).toBeFalsy()

      formControl.updateIsDirty()

      expect(formControl.formState.isDirty).toBeTruthy()
    })
  })
})
