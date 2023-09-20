import { describe, test } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('touch', () => {
    test('touch', async () => {
      const control = new FormControl({
        values: {
          name: 'Elysia',
        },
      })

      await control.touch('name', 'Elysia')
    })

    test('touch and set dirty', async () => {
      const control = new FormControl({
        values: {
          name: 'Elysia',
        },
      })

      await control.touch('name', 'dirty value', { shouldDirty: true })
    })

    test('touch and set touched', async () => {
      const control = new FormControl({
        values: {
          name: 'Elysia',
        },
      })

      await control.touch('name', 'dirty value', { shouldTouch: true })
    })

    test('touch and validate', async () => {
      const control = new FormControl({
        values: {
          name: 'Elysia',
        },
      })

      await control.touch('name', 'dirty value', { shouldValidate: true })
    })
  })
})
