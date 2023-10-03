import { describe, test, expect, vi } from 'vitest'

import { Writable, RecordDerived } from '../../src/store'

describe('store', () => {
  describe('RecordDerived', () => {
    describe('with keys set', () => {
      test('subscribes to all changes if no keys specified', () => {
        const a = new Writable(1)
        const b = new Writable(2)
        const c = new Writable(3)

        const fn = vi.fn()

        const derived = new RecordDerived({ a, b, c })

        derived.subscribe(fn)

        a.set(4)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 2, c: 3 })

        b.set(5)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 3 })

        c.set(6)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })
      })

      test('subscribes to all changes if all keys included', () => {
        const a = new Writable(1)
        const b = new Writable(2)
        const c = new Writable(3)

        const fn = vi.fn()

        const derived = new RecordDerived({ a, b, c }, new Set(['a', 'b', 'c']))

        derived.subscribe(fn)

        a.set(4)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 2, c: 3 })

        b.set(5)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 3 })

        c.set(6)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })
      })

      test('subscribes to specified keys', () => {
        const a = new Writable(1)
        const b = new Writable(2)
        const c = new Writable(3)

        const fn = vi.fn()

        const derived = new RecordDerived({ a, b, c }, new Set(['a']))

        derived.subscribe(fn)

        a.set(4)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 2, c: 3 })

        fn.mockReset()

        b.set(5)

        expect(fn).not.toHaveBeenCalled()

        c.set(6)

        expect(fn).not.toHaveBeenCalled()
      })

      test('never subscribes if empty set of keys specified', () => {
        const a = new Writable(1)
        const b = new Writable(2)
        const c = new Writable(3)

        const fn = vi.fn()

        const derived = new RecordDerived({ a, b, c }, new Set())

        derived.subscribe(fn)
        fn.mockReset()

        a.set(4)

        expect(fn).not.toHaveBeenCalled()

        b.set(5)

        expect(fn).not.toHaveBeenCalled()

        c.set(6)

        expect(fn).not.toHaveBeenCalled()
      })

      test('adapts if set of keys changes', () => {
        const a = new Writable(1)
        const b = new Writable(2)
        const c = new Writable(3)

        const fn = vi.fn()

        const derived = new RecordDerived({ a, b, c }, new Set())

        derived.subscribe(fn)
        fn.mockReset()

        a.set(4)

        expect(fn).not.toHaveBeenCalled()

        b.set(5)

        expect(fn).not.toHaveBeenCalled()

        derived.keys?.add('c')
        c.set(6)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })
      })
    })

    describe('with proxy key activation', () => {
      test('adapts if set of keys changes because of proxy access', () => {
        const a = new Writable(1)
        const b = new Writable(2)
        const c = new Writable(3)

        const fn = vi.fn()

        const derived = new RecordDerived({ a, b, c }, new Set())

        derived.subscribe(fn)
        fn.mockReset()

        a.set(4)

        expect(fn).not.toHaveBeenCalled()

        b.set(5)

        expect(fn).not.toHaveBeenCalled()

        derived.proxy.c
        c.set(6)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })
      })
    })

    test('removes all subscriptions when unsubscribed', () => {
      const a = new Writable(1)
      const b = new Writable(2)
      const c = new Writable(3)

      const fn = vi.fn()

      const derived = new RecordDerived({ a, b, c })

      const unsubscribe = derived.subscribe(fn)

      fn.mockClear()

      unsubscribe()

      a.set(4)
      b.set(5)
      c.set(6)

      expect(fn).not.toHaveBeenCalled()
    })

    describe('notify', () => {
      test('does not notify when pending', () => {
        const stores = {
          a: new Writable(1),
          b: new Writable(2),
          c: new Writable(3),
        }

        const derived = new RecordDerived(stores)

        derived.subscribe(async () => {
          await new Promise((resolve) => setTimeout(resolve, 500))
        })

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockClear()

        derived.pending = 1

        derived.notify()

        expect(fn).not.toHaveBeenCalled()
      })

      test('adds keysChangedDuringFrozen to keys when frozen', () => {
        const stores = {
          a: new Writable(1),
          b: new Writable(2),
          c: new Writable(3),
        }

        const derived = new RecordDerived(stores)

        derived.subscribe(() => {})

        derived.frozen = true

        derived.notify('a')

        expect(derived.keysChangedDuringFrozen).toEqual(['a'])
      })
    })

    describe('transaction', () => {
      test('does not notify if no relevant keys changed during transaction', () => {
        const stores = {
          a: new Writable(1),
          b: new Writable(2),
          c: new Writable(3),
        }

        const derived = new RecordDerived(stores, new Set())

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockClear()

        derived.transaction(() => {
          stores.a.set(4)
        })

        expect(fn).not.toHaveBeenCalled()
      })

      test('notifies if relevant keys changed during transaction', () => {
        const stores = {
          a: new Writable(1),
          b: new Writable(2),
          c: new Writable(3),
        }

        const derived = new RecordDerived(stores, new Set())

        // Subscribe to the 'a' writable store.
        derived.proxy.a

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockClear()

        derived.transaction(() => {
          stores.a.set(4)
        })

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 2, c: 3 })
      })
    })

    describe('freeze', () => {
      test('does not notify while frozen', () => {
        const stores = {
          a: new Writable(1),
          b: new Writable(2),
          c: new Writable(3),
        }

        const derived = new RecordDerived(stores, new Set())

        derived.freeze()

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockClear()

        stores.a.set(4)
        stores.b.set(5)
        stores.c.set(6)

        expect(fn).not.toHaveBeenCalled()
      })

      test('notifies with correct values immediately after unfreezing', () => {
        const stores = {
          a: new Writable(1),
          b: new Writable(2),
          c: new Writable(3),
        }

        const derived = new RecordDerived(stores, new Set())

        derived.freeze()

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockClear()

        stores.a.set(4)
        stores.b.set(5)
        stores.c.set(6)

        expect(fn).not.toHaveBeenCalled()

        derived.unfreeze()

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })
      })
    })
  })
})
