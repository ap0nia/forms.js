import { describe, test, expect, vi } from 'vitest'

import { Batchable } from '../../src/store/batchable'
import { Writable } from '../../src/store/writable'
import { noop } from '../../src/utils/noop'

function createStores(set = new Set<PropertyKey>(), all = false) {
  const writables = {
    a: new Writable(1),
    b: new Writable(2),
    c: new Writable(3),
  }

  const batchable = new Batchable(writables, set, all)

  return { writables, batchable }
}

describe('Batchable', () => {
  describe('constructor', () => {
    test('sets the stores to the provided stores', () => {
      const { batchable, writables } = createStores()

      expect(batchable.stores).toEqual(writables)
    })

    test('sets the keys to the provided keys', () => {
      const keys = new Set(['a', 'b'])

      const { batchable } = createStores(keys)

      expect(batchable.keys).toEqual(keys)
    })

    test('sets the all flag to the provided all flag', () => {
      const all = true

      const { batchable } = createStores(undefined, all)

      expect(batchable.all).toEqual(all)
    })

    test('sets the writable to a new writable with the values of the provided stores', () => {
      const { batchable, writables } = createStores()

      expect(batchable.writable.value).toEqual({
        a: writables.a.value,
        b: writables.b.value,
        c: writables.c.value,
      })
    })
  })

  describe('subscribe', () => {
    test('adds the subscriber to the writable subscriber set', () => {
      const { batchable } = createStores()

      batchable.subscribe(noop)

      expect(batchable.writable.subscribers.size).toEqual(1)
    })
  })

  describe('start', () => {
    test('adds subscribers to all stores', () => {
      const { batchable, writables } = createStores()

      expect(writables.a.subscribers.size).toEqual(0)
      expect(writables.b.subscribers.size).toEqual(0)
      expect(writables.c.subscribers.size).toEqual(0)

      batchable.start()

      expect(writables.a.subscribers.size).toEqual(1)
      expect(writables.b.subscribers.size).toEqual(1)
      expect(writables.c.subscribers.size).toEqual(1)
    })
  })

  describe('stop', () => {
    test('removes subscribers from all stores', () => {
      const { batchable, writables } = createStores()

      batchable.start()

      expect(writables.a.subscribers.size).toEqual(1)
      expect(writables.b.subscribers.size).toEqual(1)
      expect(writables.c.subscribers.size).toEqual(1)

      batchable.stop()

      expect(writables.a.subscribers.size).toEqual(0)
      expect(writables.b.subscribers.size).toEqual(0)
      expect(writables.c.subscribers.size).toEqual(0)
    })

    test('resets depth and unsubscriber queue', () => {
      const { batchable } = createStores()

      batchable.start()

      batchable.depth = 1

      batchable.stop()

      expect(batchable.depth).toEqual(0)
      expect(batchable.unsubscribers).toEqual([])
    })
  })

  describe('close', () => {
    test('does not set depth below 0', () => {
      const { batchable } = createStores()

      batchable.close()
      batchable.close()
      batchable.close()

      expect(batchable.depth).toEqual(0)
    })

    test('decrements depth by 1', () => {
      const { batchable } = createStores()

      batchable.depth = 3

      batchable.close()

      expect(batchable.depth).toEqual(2)
    })
  })

  describe('isTracking', () => {
    test('returns true if all is true even if the key is not tracked', () => {
      const { batchable } = createStores(undefined, true)

      expect(batchable.isTracking('a')).toBeTruthy()
    })

    test('returns true if the key is in the set of tracked keys', () => {
      const { batchable } = createStores(new Set(['a']))

      expect(batchable.isTracking('a')).toBeTruthy()
    })

    test('returns true if the context is true and the key is in the set of tracked contexts', () => {
      const { batchable } = createStores(undefined, false)

      batchable.contexts.a = []

      expect(batchable.isTracking('a', true)).toBeTruthy()
    })

    test('returns false if the context is false', () => {
      const { batchable } = createStores(undefined, false)

      expect(batchable.isTracking('a', false)).toBeFalsy()
    })

    describe('loose matching context', () => {
      test('returns true if the context is in the set of tracked contexts', () => {
        const { batchable } = createStores(undefined, false)

        batchable.contexts.a = [{ value: 'abcdef', exact: false }]

        expect(batchable.isTracking('a', ['a', 'b', 'c'])).toBeTruthy()
        expect(batchable.isTracking('a', ['x', 'b', 'z'])).toBeTruthy()
      })

      test('returns false if no values in provided context are tracked', () => {
        const { batchable } = createStores(undefined, false)

        batchable.contexts.a = [{ value: 'abcdef', exact: false }]

        expect(batchable.isTracking('a', ['x', 'y', 'z'])).toBeFalsy()
      })
    })

    describe('exact matching context', () => {
      test('returns true if the context is in the set of tracked contexts', () => {
        const { batchable } = createStores(undefined, false)

        batchable.contexts.a = [{ value: 'abcdef', exact: true }]

        expect(batchable.isTracking('a', 'abcdef')).toBeTruthy()
      })

      test('returns false if the context is not in the set of tracked contexts', () => {
        const { batchable } = createStores(undefined, false)

        batchable.contexts.a = [{ value: 'abcdef', exact: true }]

        expect(batchable.isTracking('a', 'xyz')).toBeFalsy()
      })
    })
  })

  describe('childIsTracking', () => {
    test('returns true if any child is tracking the key', () => {
      const { batchable } = createStores()

      const child = batchable.clone()

      child.keys.add('a')

      expect(child.isTracking('a')).toBeTruthy()
      expect(batchable.isTracking('a')).toBeFalsy()
      expect(batchable.childIsTracking('a')).toBeTruthy()
    })
  })

  describe('proxy', () => {
    test('accessing the proxy returns the writable value', () => {
      const { batchable, writables } = createStores()

      expect(batchable.proxy.a).toEqual(writables.a.value)
    })

    test('accessing the proxy at a key tracks the key', () => {
      const { batchable } = createStores()

      expect(batchable.keys.has('a')).toEqual(false)

      batchable.proxy.a

      expect(batchable.keys.has('a')).toEqual(true)
    })
  })

  describe('track', () => {
    test('adds key to set of tracked keys if no context provided', () => {
      const { batchable } = createStores()

      expect(batchable.keys.has('a')).toBeFalsy()

      batchable.track('a')

      expect(batchable.keys.has('a')).toBeTruthy()
    })

    test('adds context values and key to tracked contexts if context string provided', () => {
      const { batchable } = createStores()

      expect(batchable.contexts.a).toBeUndefined()

      batchable.track('a', 'b')

      expect(batchable.contexts.a).toEqual([{ value: 'b' }])
    })

    test('adds context values and key to tracked contexts if context array provided', () => {
      const { batchable } = createStores()

      expect(batchable.contexts.a).toBeUndefined()

      batchable.track('a', ['b', 'c'])

      expect(batchable.contexts.a).toEqual([{ value: 'b' }, { value: 'c' }])
    })

    test('does not add duplicate context values', () => {
      const { batchable } = createStores()

      expect(batchable.contexts.a).toBeUndefined()

      batchable.track('a', ['a', 'b'])
      batchable.track('a', ['b', 'c'])

      expect(batchable.contexts.a).toEqual([{ value: 'a' }, { value: 'b' }, { value: 'c' }])
    })

    test('adds duplicate context values with different options', () => {
      const { batchable } = createStores()

      expect(batchable.contexts.a).toBeUndefined()

      batchable.track('a', ['a', 'b'], { exact: true })
      batchable.track('a', ['b', 'c'], { exact: false })
      batchable.track('a', ['c', 'd'], { exact: false })

      expect(batchable.contexts.a).toEqual([
        { value: 'a', exact: true },
        { value: 'b', exact: true },
        { value: 'b', exact: false },
        { value: 'c', exact: false },
        { value: 'd', exact: false },
      ])
    })
  })

  describe('createTrackingProxy', () => {
    test('accessing a property tracks the key', () => {
      const { batchable } = createStores()

      expect(batchable.keys.has('a')).toBeFalsy()

      batchable.createTrackingProxy().a

      expect(batchable.keys.has('a')).toBeTruthy()
    })

    test('accessing the property without a filter returns the value at that key', () => {
      const { batchable, writables } = createStores()

      expect(batchable.keys.has('a')).toBeFalsy()

      const proxy = batchable.createTrackingProxy(undefined, undefined, false)

      expect(proxy.a).toEqual(writables.a.value)

      expect(batchable.keys.has('a')).toBeTruthy()
    })

    test('accessing the property with a filter returns a filtered object of the value at that key', () => {
      const writables = {
        a: new Writable({
          b: {
            c: 2,
          },
          d: {
            e: 3,
          },
          f: {
            g: 4,
          },
        }),
      }

      const batchable = new Batchable(writables)

      const proxy = batchable.createTrackingProxy(['b.c', 'f.g'])

      expect(proxy.a).toEqual({
        b: {
          c: 2,
        },
        f: {
          g: 4,
        },
      })
    })
  })

  describe('transaction', () => {
    test('does not notify if no tracked stores changed', () => {
      const { batchable, writables } = createStores()

      const fn = vi.fn()

      batchable.subscribe(fn, undefined, false)

      batchable.transaction(() => {
        writables.b.set(4)
        writables.c.set(5)
      })

      expect(fn).not.toHaveBeenCalled()
    })

    test('notifies if tracked stores changed', () => {
      const { batchable, writables } = createStores(new Set(['a']))

      const fn = vi.fn()

      batchable.subscribe(fn, undefined, false)

      batchable.transaction(() => {
        writables.a.set(4)
        writables.b.set(5)
        writables.c.set(6)
      })

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 }, undefined)
    })

    test('notifies if tracked stores changed even at non-zero depth', () => {
      const { batchable, writables } = createStores(new Set(['a']))

      const fn = vi.fn()

      batchable.open()
      batchable.open()
      batchable.open()

      batchable.subscribe(fn, undefined, false)

      batchable.transaction(() => {
        writables.a.set(4)
        writables.b.set(5)
        writables.c.set(6)
      })

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 }, undefined)
    })
  })

  describe('batching', () => {
    describe('tracking all stores', () => {
      test('notifies on all store changes when buffer is closed', () => {
        const { batchable, writables } = createStores(undefined, true)

        const fn = vi.fn()

        batchable.subscribe(fn, undefined, false)

        writables.a.set(4)
        writables.b.set(5)
        writables.c.set(6)

        expect(fn).toHaveBeenCalledTimes(3)
        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 }, undefined)
      })

      test('does not notify when buffer is open', () => {
        const { batchable, writables } = createStores(undefined, true)

        const fn = vi.fn()

        batchable.subscribe(fn, undefined, false)

        batchable.open()

        writables.a.set(4)

        expect(fn).not.toHaveBeenCalled()
      })

      test('notifies once after flushing the buffer', () => {
        const { batchable, writables } = createStores(undefined, true)

        const fn = vi.fn()

        batchable.subscribe(fn, undefined, false)

        batchable.open()

        writables.a.set(4)
        writables.b.set(5)
        writables.c.set(6)

        batchable.flush()

        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 }, undefined)
      })
    })

    describe('tracking selected stores', () => {
      test('does not notify on untracked store changes when buffer is closed', () => {
        const { batchable, writables } = createStores(new Set(['a']))

        const fn = vi.fn()

        batchable.subscribe(fn, undefined, false)

        writables.a.set(4)
        writables.b.set(5)
        writables.c.set(6)

        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 }, undefined)
      })

      test('does not notify when buffer is open', () => {
        const { batchable, writables } = createStores(new Set(['a']))

        const fn = vi.fn()

        batchable.subscribe(fn, undefined, false)

        batchable.open()

        writables.a.set(4)

        expect(fn).not.toHaveBeenCalled()
      })

      test('notifies after flushing if tracked stores changed', () => {
        const { batchable, writables } = createStores(new Set(['a']))

        const fn = vi.fn()

        batchable.subscribe(fn, undefined, false)

        batchable.open()

        writables.a.set(4)
        writables.b.set(5)
        writables.c.set(6)

        batchable.flush()

        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 }, undefined)
      })

      test('does not notify after flushing if no tracked stores changed', () => {
        const { batchable, writables } = createStores(new Set(['a']))

        const fn = vi.fn()

        batchable.subscribe(fn, undefined, false)

        batchable.open()

        writables.b.set(5)
        writables.c.set(6)

        batchable.flush()

        expect(fn).not.toHaveBeenCalled()
      })
    })
  })
})
