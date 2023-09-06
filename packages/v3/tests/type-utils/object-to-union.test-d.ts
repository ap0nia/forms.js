import { describe, test, expectTypeOf } from 'vitest'

import type { ObjectToUnion } from '../../src/type-utils/object-to-union'

describe('convert an object to a recursive, nested union', () => {
  test('one layer, one property', () => {
    type Input = { a: string }
    type Output = { a: string }

    expectTypeOf<ObjectToUnion<Input>>().toEqualTypeOf<Output>()
  })

  test('one layer, multiple properties', () => {
    type Input = { a: string; b: string; c: string }
    type Output = { a: string } | { b: string } | { c: string }

    expectTypeOf<ObjectToUnion<Input>>().toEqualTypeOf<Output>()
  })

  test('multiple layers, multiple properties', () => {
    type Input = {
      a: string
      b: {
        c: number
      }
      d: {
        e: {
          f: boolean
        }
      }
    }

    type Output =
      | { a: string }
      | { b: { c: number } }
      | { 'b.c': number }
      | { d: { e: { f: boolean } } }
      | { 'd.e': { f: boolean } }
      | { 'd.e.f': boolean }

    expectTypeOf<ObjectToUnion<Input>>().toEqualTypeOf<Output>()
  })

  test('immediate exit if any', () => {
    expectTypeOf<ObjectToUnion<any>>().toEqualTypeOf<any>()
  })

  test('no infinite recursion if one layer of any', () => {
    type Input = {
      a: any
      b: number
    }

    type Output = { a: any } | { b: number }

    expectTypeOf<ObjectToUnion<Input>>().toEqualTypeOf<Output>()
  })

  test('no infinite recursion if nested property is any', () => {
    type Input = {
      a: any
      b: {
        c: any
      }
      d: {
        e: {
          f: any
        }
      }
    }

    type Output =
      | { a: any }
      | { b: { c: any } }
      | { 'b.c': any }
      | { d: { e: { f: any } } }
      | { 'd.e': { f: any } }
      | { 'd.e.f': any }

    expectTypeOf<ObjectToUnion<Input>>().toEqualTypeOf<Output>()
  })
})
