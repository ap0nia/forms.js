import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('unregister', () => {
    test('removes single name from mount and array sets', () => {
      const formControl = new FormControl()

      const name = 'Aponia'

      formControl.names.mount.add(name)
      formControl.names.array.add(name)

      formControl.unregister(name)

      expect(formControl.names.mount).not.toContain(name)
      expect(formControl.names.array).not.toContain(name)
    })

    test('removes single name from mount and array sets when specified explicitly', () => {
      const formControl = new FormControl()

      const name = 'Aponia'

      formControl.names.mount.add(name)
      formControl.names.array.add(name)

      formControl.unregister(name, {
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

      formControl.unregister([name0, name1, name2])

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

      formControl.unregister()

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

      formControl.state.values.set({ [name]: 'test' })

      formControl.unregister(name)

      expect(formControl.fields).toEqual({})

      expect(formControl.state.values.value).toEqual({})
    })

    test('removes field error', () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.state.errors.set({
        [name]: {
          type: 'min',
        },
      })

      formControl.unregister(name)

      expect(formControl.state.errors.value).toEqual({})
    })

    test('removes dirty field', () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.state.dirtyFields.set({ [name]: true })

      formControl.unregister(name)

      expect(formControl.state.dirtyFields.value).toEqual({})
    })

    test('removes touched field', () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.state.touchedFields.set({ [name]: true })

      formControl.unregister(name)

      expect(formControl.state.touchedFields.value).toEqual({})
    })

    test('removes default value', () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.state.defaultValues.set({ [name]: 'test' })

      formControl.unregister(name)

      expect(formControl.state.defaultValues.value).toEqual({})
    })
  })
})
