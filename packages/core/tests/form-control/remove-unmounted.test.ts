import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { Field } from '../../src/types/fields'

describe('FormControl', () => {
  describe('removeUnmounted', () => {
    describe('removes not-alive elements', () => {
      test('sets unmounted fields to undefined', () => {
        const formControl = new FormControl()

        const name = 'test'

        const field: Field = {
          _f: {
            name,
            ref: { name },
          },
        }

        formControl.fields[name] = field

        formControl.names.unMount.add(name)

        formControl.cleanup()

        expect(formControl.fields[name]).toBeUndefined()
      })

      test('sets unmounted field with refs to undefined', () => {
        const formControl = new FormControl()

        const name = 'test'

        const field: Field = {
          _f: {
            name,
            ref: { name },
            refs: [
              document.createElement('input'),
              document.createElement('input'),
              document.createElement('input'),
            ],
          },
        }

        formControl.fields[name] = field

        formControl.names.unMount.add(name)

        formControl.cleanup()

        expect(formControl.fields[name]).toBeUndefined()
      })
    })

    describe('does not remove live elements', () => {
      test('sets unmounted fields to undefined', () => {
        const formControl = new FormControl()

        const name = 'test'

        const ref = document.createElement('input')

        document.body.appendChild(ref)

        const field: Field = {
          _f: {
            name,
            ref,
          },
        }

        formControl.fields[name] = field

        formControl.names.unMount.add(name)

        formControl.cleanup()

        expect(formControl.fields[name]).toEqual(field)
      })

      test('sets unmounted field with refs to undefined', () => {
        const formControl = new FormControl()

        const name = 'test'

        const input = document.createElement('input')

        document.body.appendChild(input)

        const field: Field = {
          _f: {
            name,
            ref: {
              name,
            },
            refs: [input],
          },
        }

        formControl.fields[name] = field

        formControl.names.unMount.add(name)

        formControl.cleanup()

        expect(formControl.fields[name]).toEqual(field)
      })
    })
  })
})
