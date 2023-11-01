import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('unregister', () => {
    test('removes single name from mount and array sets', () => {
      const formControl = new FormControl()

      const name = 'Aponia'

      formControl.names.mount.add(name)
      formControl.names.array.add(name)

      formControl.unregisterField(name)

      expect(formControl.names.mount).not.toContain(name)
      expect(formControl.names.array).not.toContain(name)
    })

    test('removes single name from mount and array sets when specified explicitly', () => {
      const formControl = new FormControl()

      const name = 'Aponia'

      formControl.names.mount.add(name)
      formControl.names.array.add(name)

      formControl.unregisterField(name, {
        keepValue: false,
        keepError: false,
        keepDirty: false,
        keepTouched: false,
        keepDefaultValue: false,
        keepIsValid: false,
      })

      expect(formControl.names.mount).not.toContain(name)
      expect(formControl.names.array).not.toContain(name)
    })

    test('removes name array from mount and array sets', () => {
      const formControl = new FormControl()

      const name0 = 'a'
      const name1 = 'b'
      const name2 = 'c'

      formControl.names.mount.add(name0)
      formControl.names.mount.add(name1)
      formControl.names.mount.add(name2)

      formControl.names.array.add(name0)
      formControl.names.array.add(name1)
      formControl.names.array.add(name2)

      formControl.unregisterField([name0, name1, name2])

      expect(formControl.names.mount).not.toContain(name0)
      expect(formControl.names.mount).not.toContain(name1)
      expect(formControl.names.mount).not.toContain(name2)

      expect(formControl.names.array).not.toContain(name0)
      expect(formControl.names.array).not.toContain(name1)
      expect(formControl.names.array).not.toContain(name2)
    })

    test('removes all names in the mount set if not specified', () => {
      const formControl = new FormControl()

      const name0 = 'a'
      const name1 = 'b'
      const name2 = 'c'

      formControl.names.mount.add(name0)
      formControl.names.mount.add(name1)
      formControl.names.mount.add(name2)

      formControl.unregisterField()

      expect(formControl.names.mount).not.toContain(name0)
      expect(formControl.names.mount).not.toContain(name1)
      expect(formControl.names.mount).not.toContain(name2)

      expect(formControl.names.array).not.toContain(name0)
      expect(formControl.names.array).not.toContain(name1)
      expect(formControl.names.array).not.toContain(name2)
    })

    test('removes field and value', () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.fields[name] = {
        _f: {
          name,
          ref: { name },
        },
      }

      formControl.stores.values.set({ [name]: 'test' })

      formControl.unregisterField(name)

      expect(formControl.fields).toEqual({})

      expect(formControl.stores.values.value).toEqual({})
    })

    test('removes field error', () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.stores.errors.set({
        [name]: {
          type: 'min',
        },
      })

      formControl.unregisterField(name)

      expect(formControl.stores.errors.value).toEqual({})
    })

    test('removes dirty field', () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.stores.dirtyFields.set({ [name]: true })

      formControl.unregisterField(name)

      expect(formControl.stores.dirtyFields.value).toEqual({})
    })

    test('removes touched field', () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.stores.touchedFields.set({ [name]: true })

      formControl.unregisterField(name)

      expect(formControl.stores.touchedFields.value).toEqual({})
    })

    test('removes default value', () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.stores.defaultValues.set({ [name]: 'test' })

      formControl.unregisterField(name)

      expect(formControl.stores.defaultValues.value).toEqual({})
    })
  })
})

// describe.skip('works correctly when called manually', () => {
//   describe('respects reset options', () => {
//     test('does not unset field value if local keepValue is true', async () => {
//       const { result } = renderHook(() => useForm({ defaultValues: { test: 'test' } }))
//
//       expect(result.current.getValues()).toEqual({ test: 'test' })
//
//       act(() => result.current.unregister('test', { keepValue: true }))
//
//       expect(result.current.getValues()).toEqual({ test: 'test' })
//     })
//
//     test('does not unset field value if root keepValue is true', async () => {
//       const { result } = renderHook(() =>
//         useForm({ defaultValues: { test: 'test' }, resetOptions: { keepValues: true } }),
//       )
//
//       expect(result.current.getValues()).toEqual({ test: 'test' })
//
//       act(() => result.current.unregister('test'))
//
//       expect(result.current.getValues()).toEqual({ test: 'test' })
//     })
//
//     test('unsets field value if local keepValue is false and root keepValue is true', async () => {
//       const { result } = renderHook(() =>
//         useForm({ defaultValues: { test: 'test' }, resetOptions: { keepValues: true } }),
//       )
//
//       expect(result.current.getValues()).toEqual({ test: 'test' })
//
//       act(() => result.current.unregister('test', { keepValue: false }))
//
//       expect(result.current.getValues()).toEqual({})
//     })
//
//     test('does not unset field value if local keepValue is true and root keepValue is false', async () => {
//       const { result } = renderHook(() =>
//         useForm({ defaultValues: { test: 'test' }, resetOptions: { keepValues: false } }),
//       )
//
//       expect(result.current.getValues()).toEqual({ test: 'test' })
//
//       act(() => result.current.unregister('test', { keepValue: true }))
//
//       expect(result.current.getValues()).toEqual({ test: 'test' })
//     })
//   })
// })
