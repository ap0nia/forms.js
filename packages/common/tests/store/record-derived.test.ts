import { describe, test, expect, vi } from 'vitest'

import { Writable, RecordDerived } from '../../src/store'

function createDerived(set?: Set<string>) {
  const stores = {
    a: new Writable(1),
    b: new Writable(2),
    c: new Writable(3),
  }

  const derived = new RecordDerived(stores, set)

  return { stores, derived }
}

describe('store', () => {
  describe('RecordDerived', () => {
    describe('with keys set', () => {
      test('subscribes to all changes if no keys specified', () => {
        const { derived, stores } = createDerived()

        const fn = vi.fn()

        derived.subscribe(fn)

        stores.a.set(4)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 2, c: 3 })

        stores.b.set(5)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 3 })

        stores.c.set(6)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })
      })

      test('subscribes to all changes if all keys included', () => {
        const fn = vi.fn()

        const { derived, stores } = createDerived()

        derived.subscribe(fn)

        stores.a.set(4)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 2, c: 3 })

        stores.b.set(5)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 3 })

        stores.c.set(6)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })
      })

      test('subscribes to specified keys', () => {
        const fn = vi.fn()

        const { derived, stores } = createDerived(new Set(['a']))

        derived.subscribe(fn)

        stores.a.set(4)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 2, c: 3 })

        fn.mockReset()

        stores.b.set(5)

        expect(fn).not.toHaveBeenCalled()

        stores.c.set(6)

        expect(fn).not.toHaveBeenCalled()
      })

      test('never subscribes if empty set of keys specified', () => {
        const fn = vi.fn()

        const { derived, stores } = createDerived(new Set())

        derived.subscribe(fn)

        fn.mockReset()

        stores.a.set(4)

        expect(fn).not.toHaveBeenCalled()

        stores.b.set(5)

        expect(fn).not.toHaveBeenCalled()

        stores.c.set(6)

        expect(fn).not.toHaveBeenCalled()
      })

      test('adapts if set of keys changes', () => {
        const fn = vi.fn()

        const { derived, stores } = createDerived(new Set())

        derived.subscribe(fn)

        fn.mockReset()

        stores.a.set(4)

        expect(fn).not.toHaveBeenCalled()

        stores.b.set(5)

        expect(fn).not.toHaveBeenCalled()

        derived.keys?.add('c')
        stores.c.set(6)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })
      })
    })

    describe('with proxy key activation', () => {
      test('adapts if set of keys changes because of proxy access', () => {
        const fn = vi.fn()

        const { derived, stores } = createDerived(new Set())

        derived.subscribe(fn)

        fn.mockReset()

        stores.a.set(4)

        expect(fn).not.toHaveBeenCalled()

        stores.b.set(5)

        expect(fn).not.toHaveBeenCalled()

        derived.proxy.c
        stores.c.set(6)

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })
      })
    })

    test('removes all subscriptions when unsubscribed', () => {
      const fn = vi.fn()

      const { derived, stores } = createDerived()

      const unsubscribe = derived.subscribe(fn)

      fn.mockReset()

      unsubscribe()

      stores.a.set(4)
      stores.b.set(5)
      stores.c.set(6)

      expect(fn).not.toHaveBeenCalled()
    })

    describe('notify', () => {
      test('does not notify when pending', () => {
        const { derived } = createDerived()

        derived.subscribe(async () => {
          await new Promise((resolve) => setTimeout(resolve, 500))
        })

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.pending = 1

        derived.notify()

        expect(fn).not.toHaveBeenCalled()
      })

      test('adds keysChangedDuringFrozen to keys when frozen', () => {
        const { derived } = createDerived()

        derived.subscribe(() => {})

        derived.rimeTrauma += 1

        derived.notify('a')

        expect(derived.keysChangedDuringFrozen).toEqual([{ key: 'a' }])
      })
    })

    describe('transaction', () => {
      test('does not notify if no relevant keys changed during transaction', () => {
        const { derived, stores } = createDerived(new Set())

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.transaction(() => {
          stores.a.set(4)
        })

        expect(fn).not.toHaveBeenCalled()
      })

      test('notifies if relevant keys changed during transaction', () => {
        const { derived, stores } = createDerived(new Set())

        // Subscribe to the 'a' writable store.
        derived.proxy.a

        const fn = vi.fn()

        derived.subscribe(fn)

        derived.transaction(() => {
          stores.a.set(4)
        })

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 2, c: 3 })
      })
    })

    describe('freeze', () => {
      test('does not notify while frozen', () => {
        const { derived, stores } = createDerived(new Set())

        derived.freeze()

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        stores.a.set(4)
        stores.b.set(5)
        stores.c.set(6)

        expect(fn).not.toHaveBeenCalled()
      })

      test('notifies with correct values immediately after unfreezing', () => {
        const { derived, stores } = createDerived()

        derived.freeze()

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        stores.a.set(4)
        stores.b.set(5)
        stores.c.set(6)

        expect(fn).not.toHaveBeenCalled()

        derived.unfreeze()

        expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })
      })

      test('does not go below 0 rime trauma', () => {
        const derived = new RecordDerived({})

        derived.rimeTrauma = -1

        derived.unfreeze()

        expect(derived.rimeTrauma).toEqual(0)
      })
    })

    describe('notify', () => {
      test('does not notify if context is false', () => {
        const { derived } = createDerived()

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.notify('a', false)

        expect(fn).not.toHaveBeenCalled()
      })

      test('notifies for exact specific tracked name', () => {
        const { derived } = createDerived(new Set())

        derived.keyNames.a = [{ value: 'Aponia' }, { value: 'Elysia' }]

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.notify('a')

        expect(fn).not.toHaveBeenCalled()

        derived.notify('a', ['Elysia'])

        expect(fn).toHaveBeenCalled()
      })

      test('notifies for loose specific tracked name', () => {
        const { derived } = createDerived(new Set())

        derived.keyNames.a = [{ value: 'Aponia' }, { value: 'Elysia' }]

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.notify('a')

        expect(fn).not.toHaveBeenCalled()

        derived.notify('a', ['Ely'])

        expect(fn).toHaveBeenCalled()
      })
    })

    describe('freeze', () => {
      test('does not notify if pending', () => {
        const { derived, stores } = createDerived()

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.freeze()

        stores.a.set(4)

        derived.pending = 1

        derived.unfreeze()

        expect(fn).not.toHaveBeenCalled()
      })

      test('notifies if no filter keys specified', () => {
        const { derived, stores } = createDerived()

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.freeze()

        stores.a.set(4)

        derived.unfreeze()

        expect(fn).toHaveBeenCalled()
      })

      test('notifies for specified filtered keys', () => {
        const { derived, stores } = createDerived(new Set(['a']))

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.freeze()

        stores.a.set(4)

        derived.unfreeze()

        expect(fn).toHaveBeenCalled()
      })

      test('does not notify for specified filtered keys', () => {
        const { derived, stores } = createDerived(new Set(['b']))

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.freeze()

        stores.a.set(4)

        derived.unfreeze()

        expect(fn).not.toHaveBeenCalled()
      })

      test('notifies when context force is true', () => {
        const { derived, stores } = createDerived(new Set(['b']))

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.freeze()

        stores.a.set(4, true)

        derived.unfreeze()

        expect(fn).toHaveBeenCalled()
      })

      test('does not notify when context force is false', () => {
        const { derived, stores } = createDerived(new Set(['b']))

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.freeze()

        stores.a.set(4, false)

        derived.unfreeze()

        expect(fn).not.toHaveBeenCalled()
      })

      test('notifies when context strings are subset of tracked', () => {
        const { derived, stores } = createDerived(new Set(['b']))

        const fn = vi.fn()

        derived.subscribe(fn)

        fn.mockReset()

        derived.freeze()

        derived.keyNames.a = [{ value: 'abc' }]

        stores.a.set(4, ['a'])

        derived.unfreeze()

        expect(fn).toHaveBeenCalled()
      })
    })

    describe('track', () => {
      test('tracks key names array', () => {
        const { derived } = createDerived()

        derived.track('a', ['a', 'b', 'c'])

        expect(derived.keyNames.a).toEqual([{ value: 'a' }, { value: 'b' }, { value: 'c' }])
      })

      test('tracks key names', () => {
        const { derived } = createDerived()

        derived.track('a', 'abc')

        expect(derived.keyNames.a).toEqual([{ value: 'abc' }])
      })
    })
  })
})
