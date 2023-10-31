import { describe, test, expect, vi } from 'vitest'

import { Writable } from '../../src/oop-stores/writable'

describe('store', () => {
  describe('Writable', () => {
    test('initially has no subscribers', () => {
      const count = new Writable(0)

      expect(count.hasSubscribers).toBeFalsy()
    })

    test('subscribing adds a subscriber', () => {
      const count = new Writable(0)

      const fn = vi.fn()

      count.subscribe(fn)

      expect(count.hasSubscribers).toBeTruthy()
    })

    test('subscription function is called once with the current value upon subscribing', () => {
      const value = 0

      const count = new Writable(value)

      const fn = vi.fn()

      count.subscribe(fn)

      expect(fn).toHaveBeenCalledTimes(1)

      expect(fn).toHaveBeenCalledWith(value)
    })

    test('subscription function is not called for same value', () => {
      const value = 0

      const count = new Writable(value)

      const fn = vi.fn()

      count.subscribe(fn)

      expect(fn).toHaveBeenCalledTimes(1)

      count.set(value)

      expect(fn).toHaveBeenCalledTimes(1)
    })

    test('does not notify subscribers if there are other queued subscribers', () => {
      const count = new Writable(0)

      const fn = vi.fn()

      count.subscribe(fn)

      fn.mockReset()

      Writable.subscriberQueue.length = 1

      count.set(1)

      expect(fn).not.toHaveBeenCalled()

      Writable.subscriberQueue.length = 0
    })

    test('calls subscriber with context', () => {
      const count = new Writable(0)

      const value = 1
      const context = { foo: 'bar' }

      const fn = vi.fn()

      count.subscribe(fn)

      fn.mockReset()

      count.set(value, context)

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(value, context)
    })
  })

  describe('Writable - from Svelte', () => {
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
