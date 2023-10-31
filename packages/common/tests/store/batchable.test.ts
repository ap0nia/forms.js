import { describe, test, expect, vi } from 'vitest'

import { Batchable } from '../../src/store/batchable'
import { Writable } from '../../src/store/writable'

function createStores(set?: Set<string>, all = false) {
  const writables = {
    a: new Writable(1),
    b: new Writable(2),
    c: new Writable(3),
  }

  const batchable = new Batchable(writables, set, all)

  return { writables, batchable }
}

describe('Batchable', () => {
  describe('properly notifies subscribers with explicitly tracked keys', () => {
    test('notifies on all changes if all is true', () => {
      const { batchable, writables } = createStores(undefined, true)

      const fn = vi.fn()

      batchable.subscribe(fn)

      fn.mockReset()

      writables.a.set(4)

      expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 2, c: 3 })

      writables.b.set(5)

      expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 3 })

      writables.c.set(6)

      expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })

      expect(fn).toHaveBeenCalledTimes(3)
    })

    test('notifies only for specified keys', () => {
      const { batchable, writables: writables } = createStores(new Set(['b']))

      const fn = vi.fn()

      batchable.subscribe(fn, undefined, false)

      writables.a.set(4)
      writables.b.set(5)
      writables.c.set(6)

      expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })
      expect(fn).toHaveBeenCalledOnce()
    })

    test('stops notifying when set of tracked keys changes', () => {
      const { batchable: derived, writables: stores } = createStores(new Set(['a']))

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
      const { batchable, writables } = createStores(undefined, true)

      const fn = vi.fn()

      batchable.subscribe(fn)

      fn.mockReset()

      batchable.transaction(() => {
        writables.a.set(4)
        writables.b.set(5)
        writables.c.set(6)
      })

      expect(fn).toHaveBeenCalledOnce()
      expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })
    })

    test('notifies once after a transaction with tracked keys', () => {
      const { batchable, writables } = createStores(new Set(['a', 'b']))

      const fn = vi.fn()

      batchable.subscribe(fn)

      fn.mockReset()

      batchable.transaction(() => {
        writables.a.set(4)
        writables.b.set(5)
        writables.c.set(6)
      })

      expect(fn).toHaveBeenCalledOnce()
      expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 5, c: 6 })
    })

    test('does not notify after a transaction with no tracked keys', () => {
      const { batchable, writables } = createStores(new Set(['d']))

      const fn = vi.fn()

      batchable.subscribe(fn)

      fn.mockReset()

      batchable.transaction(() => {
        writables.a.set(4)
        writables.b.set(5)
        writables.c.set(6)
      })

      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('properly buffers', () => {
    test('never sets the depth to a negative number', () => {
      const { batchable } = createStores()

      batchable.close()
      batchable.close()
      batchable.close()

      expect(batchable.depth).toEqual(0)
    })

    test('notifies once after flushing if key tracked at root changes', () => {
      const { batchable, writables } = createStores(new Set(['a']))

      const fn = vi.fn()

      batchable.subscribe(fn)

      fn.mockReset()

      batchable.open()

      writables.a.set(4)

      expect(fn).not.toHaveBeenCalled()

      batchable.flush()

      expect(fn).toHaveBeenCalledOnce()
      expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 2, c: 3 })
    })

    test('notifies once after flushing if tracked key and context pair changes', () => {
      const { batchable, writables } = createStores(new Set(['a']))

      const context = 'test'

      batchable.track('a', context)

      const fn = vi.fn()

      batchable.subscribe(fn)

      fn.mockReset()

      batchable.open()

      writables.a.set(4, context)

      expect(fn).not.toHaveBeenCalled()

      batchable.flush()

      expect(fn).toHaveBeenCalledOnce()
      expect(fn).toHaveBeenLastCalledWith({ a: 4, b: 2, c: 3 })
    })

    test('does not notify after flushing if tracked key and context pair does not change', () => {
      const { batchable, writables } = createStores(new Set())

      batchable.track('a', 'context')

      const fn = vi.fn()

      batchable.subscribe(fn)

      fn.mockReset()

      batchable.open()

      writables.a.set(4)

      expect(fn).not.toHaveBeenCalled()

      batchable.flush()

      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('properly tracks new keys and contexts', () => {
    test('does not track duplicates', () => {
      const { batchable } = createStores()

      batchable.track('a', 'context')
      batchable.track('a', 'context')

      expect(batchable.contexts.a).toHaveLength(1)

      batchable.track('a', 'context2', { exact: true })
      batchable.track('a', 'context2', { exact: true })

      expect(batchable.contexts.a).toHaveLength(2)
    })

    test('can track an array of contexts', () => {
      const { batchable } = createStores()

      batchable.track('a', ['context1', 'context2'])

      expect(batchable.contexts.a).toHaveLength(2)
    })

    test('does not notify if an exact match with context not found', () => {
      const { batchable, writables } = createStores(new Set())

      batchable.track('a', 'context', { exact: true })

      const fn = vi.fn()

      batchable.subscribe(fn)

      fn.mockReset()

      batchable.open()

      writables.a.set(4, 'context a')

      batchable.flush()

      expect(fn).not.toHaveBeenCalled()
    })

    test('forces update for specific key if context is true', () => {
      const { batchable, writables } = createStores(new Set())

      batchable.track('a', 'context', { exact: true })

      const fn = vi.fn()

      batchable.subscribe(fn)

      fn.mockReset()

      batchable.open()

      writables.a.set(4, true)

      batchable.flush()

      expect(fn).toHaveBeenCalled()
    })
  })

  describe('isTracking', () => {
    test('returns true if key is in set', () => {
      const { batchable } = createStores(new Set(['a']))

      expect(batchable.isTracking('a')).toBeTruthy()
    })

    test('returns true if key and context are in trackedContexts', () => {
      const { batchable } = createStores(new Set())

      batchable.track('a', 'context')

      expect(batchable.isTracking('a', ['context'])).toBeTruthy()
    })

    test('returns true if context is a substring of tracked context', () => {
      const { batchable } = createStores(new Set())

      batchable.track('a', 'context')

      expect(batchable.isTracking('a', ['cont'])).toBeTruthy()
    })

    test('returns true if tracked context is a substring of context', () => {
      const { batchable } = createStores(new Set())

      batchable.track('a', 'cont')

      expect(batchable.isTracking('a', ['context'])).toBeTruthy()
    })

    test('returns false if context is not an exact match', () => {
      const { batchable } = createStores(new Set())

      batchable.track('a', 'context', { exact: true })

      expect(batchable.isTracking('a', ['context-a'])).toBeFalsy()
    })
  })

  describe('childIsTracking', () => {
    test('returns true if any child is tracking key', () => {
      const { batchable } = createStores()

      const child = batchable.clone()

      child.track('a')

      batchable.children.add(child)

      expect(batchable.childIsTracking('a')).toBeTruthy()
    })
  })

  describe('clone', () => {
    test('adds the clone to the children set', () => {
      const { batchable } = createStores()

      const child = batchable.clone()

      expect(batchable.children).toContain(child)
    })

    test('independently triggers updates between parent and child', () => {
      const { batchable, writables } = createStores(new Set(['a']))

      const child = batchable.clone(new Set(['b']))

      const parentFn = vi.fn()
      const childFn = vi.fn()

      batchable.subscribe(parentFn)
      child.subscribe(childFn)

      parentFn.mockReset()
      childFn.mockReset()

      writables.a.set(4)

      expect(parentFn).toHaveBeenCalledOnce()
      expect(childFn).not.toHaveBeenCalled()

      writables.b.set(5)

      expect(parentFn).toHaveBeenCalledOnce()
      expect(childFn).toHaveBeenCalledOnce()
    })
  })

  describe('track', () => {
    test('adds the name to the root keys if no context is provided', () => {
      const { batchable } = createStores()

      batchable.track('a')

      expect(batchable.keys).toContain('a')
    })

    test('adds the name and context to trackedContexts if context is provided', () => {
      const { batchable } = createStores()

      batchable.track('a', 'context')

      expect(batchable.contexts.a).toEqual([{ value: 'context' }])
    })
  })

  describe('createTrackingProxy', () => {
    test('accessing tracking proxy adds keys to tracked set', () => {
      const { batchable } = createStores()

      const name = 'hello'

      const proxy = batchable.createTrackingProxy(name)

      proxy.a

      expect(batchable.contexts.a).toEqual([{ value: name }])
    })

    test('accessing tracked proxy with no filter tracks the entire value', () => {
      const { batchable } = createStores()

      const proxy = batchable.createTrackingProxy(undefined, undefined, false)

      expect(proxy.a).toEqual(batchable.writable.value.a)
      expect(batchable.keys).toContain('a')
    })
  })

  describe('properly manages subscription lifetimes', () => {
    test('removes all subscribers from internal stores after last subscriber unsubscribes', () => {
      const { batchable } = createStores()

      const unsubscribe = batchable.subscribe(() => {})

      for (const key in batchable.stores) {
        expect(batchable.stores[key as keyof typeof batchable.stores].subscribers).toHaveLength(1)
      }

      unsubscribe()

      for (const key in batchable.stores) {
        expect(batchable.stores[key as keyof typeof batchable.stores].subscribers).toHaveLength(0)
      }
    })
  })

  describe('proxy', () => {
    test('accessing proxy at one key adds key to tracked keys set', () => {
      const { batchable } = createStores()

      batchable.proxy.a

      expect(batchable.keys).toContain('a')
    })

    test('accessing proxy at multiple keys adds keys to tracked keys set', () => {
      const { batchable } = createStores()

      batchable.proxy.a
      batchable.proxy.b
      batchable.proxy.c

      expect(batchable.keys).toContain('a')
      expect(batchable.keys).toContain('b')
      expect(batchable.keys).toContain('c')
    })
  })
})
