import { describe, test, expect, vi } from 'vitest'

import { Writable } from '../../src/store/writable'
import { noop } from '../../src/utils/noop'

describe('Writable', () => {
  describe('constructor', () => {
    test('sets initial value to undefined if no value is provided', () => {
      const store = new Writable()

      expect(store.value).toEqual(undefined)
    })

    test('sets initial value to the provided value', () => {
      const store = new Writable(1)

      expect(store.value).toEqual(1)
    })

    test('sets start to noop if no start function is provided', () => {
      const store = new Writable()

      expect(store.start).toBeInstanceOf(Function)
    })

    test('sets start to the provided start function', () => {
      const start = () => {}

      const store = new Writable(undefined, start)

      expect(store.start).toEqual(start)
    })
  })

  describe('update', () => {
    test('sets the store value to the result of the updater function', () => {
      const result = { a: 1, b: 2, c: 3 }

      const store = new Writable<typeof result>()

      store.update(() => result)

      expect(store.value).toEqual(result)
    })

    test('calls subscription function with the new value', () => {
      const result = { a: 1, b: 2, c: 3 }

      const store = new Writable<typeof result>()

      const fn = vi.fn()

      store.subscribe(fn)

      store.update(() => result)

      expect(fn).toHaveBeenCalledWith(result, undefined)
    })

    test('calls subscription function with the new value and context', () => {
      const result = { a: 1, b: 2, c: 3 }

      const store = new Writable<typeof result, typeof result>()

      const fn = vi.fn()

      store.subscribe(fn)

      store.update(() => result, result)

      expect(fn).toHaveBeenCalledWith(result, result)
    })
  })

  describe('set', () => {
    test('does not notify subscribers for the same primitive value', () => {
      const store = new Writable(1)

      const fn = vi.fn()

      store.subscribe(fn, undefined, false)

      store.set(1)

      expect(fn).not.toHaveBeenCalled()
    })

    test('sets the store value to the new value', () => {
      const result = { a: 1, b: 2, c: 3 }

      const store = new Writable<typeof result>()

      store.set(result)

      expect(store.value).toEqual(result)
    })

    test('calls subscription function with the new value', () => {
      const result = { a: 1, b: 2, c: 3 }

      const store = new Writable<typeof result>()

      const fn = vi.fn()

      store.subscribe(fn)

      store.set(result)

      expect(fn).toHaveBeenLastCalledWith(result, undefined)
    })

    test('calls subscription function with the new value and context', () => {
      const result = { a: 1, b: 2, c: 3 }

      const store = new Writable<typeof result, typeof result>()

      const fn = vi.fn()

      store.subscribe(fn)

      store.set(result, result)

      expect(fn).toHaveBeenLastCalledWith(result, result)
    })

    test('calls provided invalidate function', () => {
      const result = { a: 1, b: 2, c: 3 }

      const store = new Writable<typeof result>()

      const invalidator = vi.fn()

      store.subscribe(noop, invalidator)

      store.set(result)

      expect(invalidator).toHaveBeenCalled()
    })

    test('resets subscriber queue after notifying all subscribers', () => {
      const result = { a: 1, b: 2, c: 3 }

      const store = new Writable<typeof result>()

      store.subscribe(noop)

      store.set(result)

      expect(Writable.subscriberQueue).toEqual([])
    })

    test('does not notify subscribers if the subscriber queue is not empty', () => {
      const result = { a: 1, b: 2, c: 3 }

      const store = new Writable<typeof result>()

      const fn = vi.fn()

      store.subscribe(fn, undefined, false)

      Writable.subscriberQueue.length = 1

      store.set(result)

      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('subscribe', () => {
    test('does not notify on initial subscription if runFirst is false', () => {
      const store = new Writable(1)

      const fn = vi.fn()

      store.subscribe(fn, undefined, false)

      expect(fn).not.toHaveBeenCalled()
    })

    test('calls the intially provided start function during the first subscription', () => {
      const start = vi.fn()

      const store = new Writable(undefined, start)

      store.subscribe(noop, noop, false)

      expect(start).toHaveBeenCalledOnce()
    })

    test('calls the stop function returned by the start function after the last unsubscription', () => {
      const stop = vi.fn()

      const start = () => stop

      const store = new Writable(undefined, start)

      store.subscribe(noop, noop, false)()

      expect(stop).toHaveBeenCalledOnce()
    })

    test('only notifies once if the start function also sets the value', () => {
      const result = { a: 1, b: 2, c: 3 }

      const store = new Writable<typeof result>(undefined, (set) => {
        set(result)
      })

      const fn = vi.fn()

      store.subscribe(fn)()

      expect(fn).toHaveBeenCalledOnce()
      expect(fn).toHaveBeenLastCalledWith(result, undefined)
    })
  })
})
