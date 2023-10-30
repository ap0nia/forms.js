import { describe, test, expect, vi } from 'vitest'

import { Batchable } from '../../src/storev2/batchable'
import { Writable } from '../../src/storev2/writable'

function createDerived(set?: Set<string>, all = false) {
  const stores = {
    a: new Writable(1),
    b: new Writable(2),
    c: new Writable(3),
  }

  const derived = new Batchable(stores, set, all)

  return { stores, derived }
}

describe('store', () => {
  describe('Batchable', () => {
    describe('properly notifies subscribers with explicitly tracked keys', () => {
      test('notifies on all changes if all is true', () => {
        const { derived, stores } = createDerived(undefined, true)

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        stores.a.set(4)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 2, c: 3 })

        stores.b.set(5)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 3 })

        stores.c.set(6)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })

        expect(fn).toHaveBeenCalledTimes(3)
      })

      test('notifies only for specified keys', () => {
        const { derived, stores } = createDerived(new Set(['b']))

        const fn = vi.fn()

        derived.subscribe(fn, undefined, false)

        stores.a.set(4)
        stores.b.set(5)
        stores.c.set(6)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })
        expect(fn).toHaveBeenCalledOnce()
      })

      test('stops notifying when set of tracked keys changes', () => {
        const { derived, stores } = createDerived(new Set(['a']))

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        stores.a.set(4)
        expect(fn).toHaveBeenCalledOnce()

        derived.keys?.delete('a')
        derived.keys?.add('b')

        stores.a.set(10)
        expect(fn).toHaveBeenCalledOnce()
      })
    })

    describe('properly handles transactions', () => {
      test('notifies once after a transaction if tracking all keys', () => {
        const { derived, stores } = createDerived(undefined, true)

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.transaction(() => {
          stores.a.set(4)
          stores.b.set(5)
          stores.c.set(6)
        })

        expect(fn).toHaveBeenCalledOnce()
        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })
      })

      test('notifies once after a transaction with tracked keys', () => {
        const { derived, stores } = createDerived(new Set(['a', 'b']))

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.transaction(() => {
          stores.a.set(4)
          stores.b.set(5)
          stores.c.set(6)
        })

        expect(fn).toHaveBeenCalledOnce()
        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })
      })

      test('does not notify after a transaction with no tracked keys', () => {
        const { derived, stores } = createDerived(new Set(['d']))

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.transaction(() => {
          stores.a.set(4)
          stores.b.set(5)
          stores.c.set(6)
        })

        expect(fn).not.toHaveBeenCalled()
      })
    })

    describe('properly buffers', () => {
      test('never sets the depth to a negative number', () => {
        const { derived } = createDerived()

        derived.close()
        derived.close()
        derived.close()

        expect(derived.depth).toEqual(0)
      })

      test('notifies once after flushing if key tracked at root changes', () => {
        const { derived, stores } = createDerived(new Set(['a']))

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.open()

        stores.a.set(4)

        expect(fn).not.toHaveBeenCalled()

        derived.flush()

        expect(fn).toHaveBeenCalledOnce()
        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 2, c: 3 })
      })

      test('notifies once after flushing if tracked key and context pair changes', () => {
        const { derived, stores } = createDerived(new Set(['a']))

        const context = 'test'

        derived.track('a', context)

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.open()

        stores.a.set(4, context)

        expect(fn).not.toHaveBeenCalled()

        derived.flush()

        expect(fn).toHaveBeenCalledOnce()
        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 2, c: 3 })
      })

      test('does not notify after flushing if tracked key and context pair does not change', () => {
        const { derived, stores } = createDerived(new Set())

        derived.track('a', 'context')

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.open()

        stores.a.set(4)

        expect(fn).not.toHaveBeenCalled()

        derived.flush()

        expect(fn).not.toHaveBeenCalled()
      })
    })

    describe('properly tracks new keys and contexts', () => {
      test('does not track duplicates', () => {
        const { derived } = createDerived()

        derived.track('a', 'context')
        derived.track('a', 'context')

        expect(derived.contexts.a).toHaveLength(1)

        derived.track('a', 'context2', { exact: true })
        derived.track('a', 'context2', { exact: true })

        expect(derived.contexts.a).toHaveLength(2)
      })

      test('can track an array of contexts', () => {
        const { derived } = createDerived()

        derived.track('a', ['context1', 'context2'])

        expect(derived.contexts.a).toHaveLength(2)
      })

      test('does not notify if an exact match with context not found', () => {
        const { derived, stores } = createDerived(new Set())

        derived.track('a', 'context', { exact: true })

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.open()

        stores.a.set(4, 'context a')

        derived.flush()

        expect(fn).not.toHaveBeenCalled()
      })

      test('forces update for specific key if context is true', () => {
        const { derived, stores } = createDerived(new Set())

        derived.track('a', 'context', { exact: true })

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.open()

        stores.a.set(4, true)

        derived.flush()

        expect(fn).toHaveBeenCalled()
      })
    })

    describe('isTracking', () => {
      test('returns true if key is in set', () => {
        const { derived } = createDerived(new Set(['a']))

        expect(derived.isTracking('a')).toBeTruthy()
      })

      test('returns true if key and context are in trackedContexts', () => {
        const { derived } = createDerived(new Set())

        derived.track('a', 'context')

        expect(derived.isTracking('a', ['context'])).toBeTruthy()
      })

      test('returns true if context is a substring of tracked context', () => {
        const { derived } = createDerived(new Set())

        derived.track('a', 'context')

        expect(derived.isTracking('a', ['cont'])).toBeTruthy()
      })

      test('returns true if tracked context is a substring of context', () => {
        const { derived } = createDerived(new Set())

        derived.track('a', 'cont')

        expect(derived.isTracking('a', ['context'])).toBeTruthy()
      })

      test('returns false if context is not an exact match', () => {
        const { derived } = createDerived(new Set())

        derived.track('a', 'context', { exact: true })

        expect(derived.isTracking('a', ['context-a'])).toBeFalsy()
      })
    })

    describe('properly manages subscription lifetimes', () => {
      test('removes all subscribers from internal stores after last subscriber unsubscribes', () => {
        const { derived } = createDerived()

        const unsubscribe = derived.subscribe(() => {})

        for (const key in derived.stores) {
          expect(derived.stores[key as keyof typeof derived.stores].subscribers).toHaveLength(1)
        }

        unsubscribe()

        for (const key in derived.stores) {
          expect(derived.stores[key as keyof typeof derived.stores].subscribers).toHaveLength(0)
        }
      })
    })
  })
})
