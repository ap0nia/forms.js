import user from '@testing-library/user-event'
import { describe, test, expect } from 'vitest'

import { cloneObject } from '../../src/utils/clone-object'

describe('cloneObject', () => {
  test('returns new date if passed a date', () => {
    const date = new Date()
    const clone = cloneObject(date)

    expect(clone).not.toBe(date)
    expect(clone).toEqual(date)
  })

  test('returns new set if passed a set', () => {
    const set = new Set([1, 2, 3])
    const clone = cloneObject(set)

    expect(clone).not.toBe(set)
    expect(clone).toEqual(set)
  })

  test('returns same Blob instance if passed a Blob', () => {
    const blob = new Blob()
    const clone = cloneObject(blob)

    expect(clone).toBe(blob)
  })

  test('returns same FileList instance if passed a FileList', () => {
    const input = document.createElement('input')
    input.type = 'file'

    user.upload(input, [])

    const fileList = input.files

    const clone = cloneObject(fileList)

    expect(clone).toBe(fileList)
  })

  test('returns same FileList instance in nested object', () => {
    const input = document.createElement('input')
    input.type = 'file'

    user.upload(input, [])

    const fileList = input.files

    const object = {
      a: {
        b: {
          c: fileList,
        },
      },
    }

    const clone = cloneObject(object)

    expect(clone.a.b.c).toBe(object.a.b.c)
  })

  test('returns same Blob instance in nested array in object', () => {
    const blob = new Blob()

    const object = {
      a: {
        b: {
          c: [blob],
        },
      },
    }

    const clone = cloneObject(object)

    expect(clone.a.b.c[0]).toBe(object.a.b.c[0])
  })
})
