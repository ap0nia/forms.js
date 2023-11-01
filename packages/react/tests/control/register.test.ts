import { describe, test, expect } from 'vitest'

import { Control } from '../../src/control'

describe('control', () => {
  describe('register', () => {
    describe('returns correct props', () => {
      describe('returns correct disabled value', () => {
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

      describe('returns correct progressive validation props', () => {
        describe('required', () => {
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
        })

        describe('min', () => {
          test('returns min as provided value', () => {
            const control = new Control({ progressive: true })

            const props = control.register('name', { min: 'min' })

            expect(props.min).toEqual('min')
          })

          test('extracts string from provided min', () => {
            const control = new Control({ progressive: true })

            const props = control.register('name', {
              min: { value: 'min', message: 'out of bounds' },
            })

            expect(props.min).toEqual('min')
          })

          test('extracts number from provided min', () => {
            const control = new Control({ progressive: true })

            const props = control.register('name', {
              min: { value: 0, message: 'out of bounds' },
            })

            expect(props.min).toEqual(0)
          })

          test('returns min as undefined if min not provided', () => {
            const control = new Control({ progressive: true })

            const props = control.register('name')

            expect(props.min).toBeUndefined()
          })
        })

        describe.todo('max', () => {})

        describe.todo('minLength', () => {})

        describe.todo('maxLength', () => {})

        describe.todo('pattern', () => {})
      })
    })
  })
})
