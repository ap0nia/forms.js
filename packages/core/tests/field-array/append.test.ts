import { describe, test, expect, vi, beforeEach } from 'vitest'

import { FieldArray } from '../../src/field-array'
import { FormControl } from '../../src/form-control'

let i = 0

vi.mock('../../src/utils/generate-id', async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...(mod ?? undefined),
    generateId: () => String(i++),
  }
})

beforeEach(() => {
  i = 0
})

describe('FieldArray', () => {
  describe('append', () => {
    test('should not append dirtyFields fields if not being tracked', async () => {
      const control = new FormControl<{ test: { value: string }[] }>({
        defaultValues: {
          test: [{ value: 'plz change' }, { value: 'dont change' }, { value: 'dont change' }],
        },
      })

      const fieldArray = new FieldArray({ control, name: 'test' })

      control.state.dirtyFields.set({
        test: [{ value: false }],
      })

      fieldArray.append({ value: 'test' })

      expect(control.state.dirtyFields.value).toEqual({
        test: [{ value: false }],
      })
    })

    test('should append dirtyFields fields if being tracked', () => {
      const control = new FormControl<{ test: { value: string }[] }>({
        defaultValues: {
          test: [{ value: 'plz change' }, { value: 'dont change' }, { value: 'dont change' }],
        },
      })

      control.derivedState.proxy.dirtyFields

      const fieldArray = new FieldArray({ control, name: 'test' })

      fieldArray.append({ value: '' })

      expect(control.state.dirtyFields.value).toEqual({
        test: [{ value: false }, { value: false }, { value: false }, { value: true }],
      })
    })

    test('should append data into the fields', () => {
      const control = new FormControl<{ test: { test: string }[] }>()

      const fieldArray = new FieldArray({ control, name: 'test' })

      control.mount()

      // Subscribe once.
      fieldArray.fields.subscribe(vi.fn())

      fieldArray.append({ test: 'test' })

      expect(fieldArray.fields.value).toEqual([{ id: '0', test: 'test' }])

      fieldArray.append({ test: 'test' })

      expect(fieldArray.fields.value).toEqual([
        { id: '0', test: 'test' },
        { id: '1', test: 'test' },
      ])

      fieldArray.append([{ test: 'test-batch' }, { test: 'test-batch1' }])

      expect(fieldArray.fields.value).toEqual([
        { id: '0', test: 'test' },
        { id: '1', test: 'test' },
        { id: '2', test: 'test-batch' },
        { id: '3', test: 'test-batch1' },
      ])
    })

    test('should trigger re-render when user is watching the all field array', () => {
      const watched: unknown[] = []

      const control = new FormControl<{ test: { value: string }[] }>()

      control.derivedState.subscribe((state) => {
        watched.push(state.values)
      })

      control.watch()

      const fieldArray = new FieldArray({ control, name: 'test' })

      fieldArray.append({ value: '' })

      expect(watched).toEqual([{}, { test: [{ value: '' }] }])
    })
  })
})
