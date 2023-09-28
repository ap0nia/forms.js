import { describe, test, expect, vi } from 'vitest'

import { Writable } from '../src/store'

describe('store', () => {
  describe('writable', () => {
    test('initially has no subscribers', () => {
      const count = new Writable(0)

      expect(count.hasSubscribers).toBeFalsy()
    })

    test('subscribing adds a subscriber', () => {
      const count = new Writable(0)

      const mock = vi.fn().mockImplementation(() => {
        /* noop */
      })

      count.subscribe(mock)

      expect(count.hasSubscribers).toBeTruthy()
    })

    test('subscription function is called once with the current value upon subscribing', () => {
      const value = 69

      const count = new Writable(value)

      const mock = vi.fn().mockImplementation(() => {
        /* noop */
      })

      count.subscribe(mock)

      expect(mock).toHaveBeenCalledTimes(1)

      expect(mock).toHaveBeenCalledWith(value)
    })

    test('subscription function is not called for same value', () => {
      const value = 0

      const count = new Writable(value)

      const mock = vi.fn().mockImplementation(() => {
        /* noop */
      })

      count.subscribe(mock)

      expect(mock).toHaveBeenCalledTimes(1)

      count.set(value)

      expect(mock).toHaveBeenCalledTimes(1)
    })
  })
})

/**
 * @see https://github.com/sveltejs/svelte/blob/master/packages/svelte/test/store/store.test.js
 */
describe('store - svelte', () => {
  describe('writable', () => {
    test('creates a writable store', () => {
      const count = new Writable(0)
      const values: number[] = []

      const unsubscribe = count.subscribe((value) => {
        values.push(value)
      })

      count.set(1)
      count.update((n) => n + 1)

      unsubscribe()

      count.set(3)
      count.update((n) => n + 1)

      expect(values).toEqual([0, 1, 2])
    })

    test('creates an undefined writable store', () => {
      const store = new Writable()
      const values: unknown[] = []

      const unsubscribe = store.subscribe((value) => {
        values.push(value)
      })

      unsubscribe()

      expect(values).toEqual([undefined])
    })

    test('calls provided subscribe handler', () => {
      let called = 0

      const store = new Writable(0, () => {
        called += 1
        return () => (called -= 1)
      })

      const unsubscribe1 = store.subscribe(() => {})
      expect(called).toEqual(1)

      const unsubscribe2 = store.subscribe(() => {})
      expect(called).toEqual(1)

      unsubscribe1()
      expect(called).toEqual(1)

      unsubscribe2()
      expect(called).toEqual(0)
    })

    test('does not assume immutable data', () => {
      const obj = {}
      let called = 0

      const store = new Writable(obj)

      store.subscribe(() => {
        called += 1
      })

      store.set(obj)
      expect(called).toEqual(2)

      store.update((obj) => obj)
      expect(called).toEqual(3)
    })

    test('only calls subscriber once initially, including on resubscriptions', () => {
      let num = 0
      const store = new Writable(num, (set) => set((num += 1)))

      let count1 = 0
      let count2 = 0

      store.subscribe(() => (count1 += 1))()
      expect(count1).toEqual(1)

      const unsubscribe = store.subscribe(() => (count2 += 1))
      expect(count2).toEqual(1)

      unsubscribe()
    })

    test('no error even if unsubscribe calls twice', () => {
      let num = 0
      const store = new Writable(num, (set) => set((num += 1)))
      const unsubscribe = store.subscribe(() => {})
      unsubscribe()
      expect(() => unsubscribe()).not.toThrowError()
    })
  })
})
