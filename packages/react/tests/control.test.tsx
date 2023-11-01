import { describe, test } from 'vitest'

import { Control } from '../src/control'

describe('control', () => {
  describe('react-hook-form interop', () => {
    test('returns fields when _fields getter is accessed', () => {
      const control = new Control()

      expect(control._fields).toBe(control.fields)
    })
  })

  describe('register', () => {
    describe('returns correct props', () => {
      describe('disabled prop', () => {
        test('returns disabled as true if provided as true', () => {
          const control = new Control()

          const props = control.register('name', { disabled: true })

          expect(props.disabled).toBeTruthy()
        })

        test('returns disabled as false if provided as false', () => {
          const control = new Control()

          const props = control.register('name', { disabled: false })

          expect(props.disabled).toBeFalsy()
        })

        test('does not include disabled if not provided', () => {
          const control = new Control()

          const props = control.register('name')

          expect(props.disabled).toBeUndefined()
        })
      })

      describe('progressive validation props', () => {
        test('returns required as true if required provided as true', () => {
          const control = new Control({ progressive: true })

          const props = control.register('name', { required: true })

          expect(props.required).toBeTruthy()
        })

        test('returns required as false if required provided as false', () => {
          const control = new Control({ progressive: true })

          const props = control.register('name', { required: false })

          expect(props.required).toBeFalsy()
        })

        test('returns required as false if required not provided', () => {
          const control = new Control({ progressive: true })

          const props = control.register('name')

          expect(props.required).toBeFalsy()
        })

        test('returns min as provided value', () => {
          const control = new Control({ progressive: true })

          const props = control.register('name', { min: 'min' })

          expect(props.min).toEqual('min')
        })

        test('returns min as provided (extracted) value', () => {
          const control = new Control({ progressive: true })

          const props = control.register('name', {
            min: { value: 'min', message: 'out of bounds' },
          })

          expect(props.min).toEqual('min')
        })

        test('returns min as undefined if min not provided', () => {
          const control = new Control({ progressive: true })

          const props = control.register('name')

          expect(props.min).toBeUndefined()
        })
      })

      describe.todo('ref prop', () => {})
    })
  })

  describe('unregister', () => {
    test('unregisters field', () => {
      const control = new Control()

      const name = 'name'

      control.fields[name] = {
        _f: {
          name,
          ref: { name },
        },
      }

      control.unregister(name)

      expect(control.fields[name]).toBeUndefined()
    })
  })
})
