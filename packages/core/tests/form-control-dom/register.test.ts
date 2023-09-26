import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('register', () => {
    test('unmounts properly', () => {
      const formControl = new FormControl()

      formControl.register('test')

      expect(formControl.state.values.value).toEqual({ test: undefined })

      formControl.unmount()

      expect(formControl.state.values.value).toEqual({})
    })
  })

  test('field array is preserved when unmounting', () => {
    const formControl = new FormControl<{ test: string[] }>()

    formControl.register('test.0')
    formControl.register('test.1')
    formControl.register('test.2')

    expect(formControl.state.values.value).toEqual({ test: [undefined, undefined, undefined] })

    formControl.unmount()

    expect(formControl.state.values.value).toEqual({ test: [undefined, undefined, undefined] })
  })

  test('preserves errors when unmounting', async () => {
    const formControl = new FormControl<{ test: string }>()

    formControl.register('test', { required: true })

    await formControl.handleSubmit()()

    expect(formControl.state.errors.value.test).toBeDefined()

    formControl.unmount()

    expect(formControl.state.errors.value.test).toBeDefined()
  })
})
