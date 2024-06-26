import { describe, test, expect } from 'vitest'

import { getFieldEventValue } from '../../../src/logic/fields/get-field-event-value'
import type { Field } from '../../../src/types/fields'

describe('getFieldEventValue', () => {
  test('returns the event if event.target.type is not defined', () => {
    const ref = document.createElement('input')

    const field: Field = {
      _f: {
        name: ref.name,
        ref,
      },
    }

    const event = new Event('')

    expect(getFieldEventValue(event, field)).toBe(event)
  })

  test('returns the field value when event.target.type is defined', () => {
    const ref = document.createElement('input')
    ref.value = 'test'

    const field: Field = {
      _f: {
        name: ref.name,
        ref,
      },
    }

    const genericEvent = new Event('')

    const event: any = { ...genericEvent, target: { type: 'text' } }

    expect(getFieldEventValue(event, field)).toBe(ref.value)
  })
})
