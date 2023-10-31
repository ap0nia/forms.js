import { describe, test, expect, vi } from 'vitest'

import { Bufferable } from '../../src/storev2/bufferable'
import { Writable } from '../../src/storev2/writable'

describe('Bufferable', () => {
  test('does not notify if listening to all changes but not fully closed', () => {
    const store = new Bufferable(new Writable({}), undefined, true)

    const fn = vi.fn()

    store.subscribe(fn, undefined, false)

    store.open()
    store.open()
    store.flush()

    expect(fn).not.toHaveBeenCalled()
  })

  describe('properly updates based on the provided buffer', () => {
    test('does not update when no keys in buffered updates are tracked', () => {
      const store = new Bufferable(new Writable({}), new Set(['a']))

      const fn = vi.fn()

      store.subscribe(fn, undefined, false)

      store.open()
      store.flush(undefined, [{ key: 'b' }])

      expect(fn).not.toHaveBeenCalled()
    })

    test('updates when a buffered update contains a tracked key', () => {
      const store = new Bufferable(new Writable({}), new Set(['a']))

      const fn = vi.fn()

      store.subscribe(fn, undefined, false)

      store.open()
      store.flush(undefined, [{ key: 'a' }])

      expect(fn).toHaveBeenCalled()
    })

    test('does not update when a buffered update contains the wrong context', () => {
      const store = new Bufferable(new Writable({ a: 1 }))

      const fn = vi.fn()

      store.subscribe(fn, undefined, false)

      store.track('a', 'hello')

      store.open()
      store.flush(undefined, [{ key: 'a', context: ['goodbye'] }])

      expect(fn).not.toHaveBeenCalled()
    })

    test('updates when a buffered update contains the correct context', () => {
      const store = new Bufferable(new Writable({ a: 1 }))

      const fn = vi.fn()

      store.subscribe(fn, undefined, false)

      store.track('a', 'hello')

      store.open()
      store.flush(undefined, [{ key: 'a', context: ['hello'] }])

      expect(fn).toHaveBeenCalled()
    })

    test('does not update when buffered update contains false context', () => {
      const store = new Bufferable(new Writable({ a: 1 }))

      const fn = vi.fn()

      store.subscribe(fn, undefined, false)

      store.track('a', 'hello')

      store.open()
      store.flush(undefined, [{ key: 'a', context: false }])

      expect(fn).not.toHaveBeenCalled()
    })

    test('updates when buffered update contains true context', () => {
      const store = new Bufferable(new Writable({ a: 1 }))

      const fn = vi.fn()

      store.subscribe(fn, undefined, false)

      store.track('a', 'hello')

      store.open()
      store.flush(undefined, [{ key: 'a', context: true }])

      expect(fn).toHaveBeenCalled()
    })

    test('does not update when buffered update does not contain exact context', () => {
      const store = new Bufferable(new Writable({ a: 1 }))

      const fn = vi.fn()

      store.subscribe(fn, undefined, false)

      store.track('a', 'hello', { exact: true })

      store.open()
      store.flush(undefined, [{ key: 'a', context: ['ello', 'hel'] }])

      expect(fn).not.toHaveBeenCalled()
    })

    test('updates when buffered update contains exact context', () => {
      const store = new Bufferable(new Writable({ a: 1 }))

      const fn = vi.fn()

      store.subscribe(fn, undefined, false)

      store.track('a', 'hello', { exact: true })

      store.open()
      store.flush(undefined, [{ key: 'a', context: ['hello'] }])

      expect(fn).toHaveBeenCalled()
    })

    test('updates when buffered update contains loosely matching context', () => {
      const store = new Bufferable(new Writable({ a: 1 }))

      const fn = vi.fn()

      store.subscribe(fn, undefined, false)

      store.track('a', 'hello', { exact: false })

      store.open()
      store.flush(undefined, [{ key: 'a', context: ['ello', 'hel'] }])

      expect(fn).toHaveBeenCalled()
    })
  })

  describe('track', () => {
    test('adds provided key to tracked keys set if no context is provided', () => {
      const store = new Bufferable(new Writable({}))

      store.track('a')

      expect(store.keys).toContain('a')
    })

    test('adds provided key and context to tracked contexts for string context', () => {
      const store = new Bufferable(new Writable({}))

      store.track('a', 'hello')

      expect(store.contexts['a']).toEqual([{ value: 'hello' }])
    })

    test('adds provided key and context to tracked contexts for string array context', () => {
      const store = new Bufferable(new Writable({}))

      store.track('a', ['hello', 'goodbye'])

      expect(store.contexts['a']).toEqual([{ value: 'hello' }, { value: 'goodbye' }])
    })

    test('does not add duplicate key and context', () => {
      const store = new Bufferable(new Writable({}))

      store.track('a', 'hello')
      store.track('a', 'hello')

      expect(store.contexts['a']).toEqual([{ value: 'hello' }])
    })

    test('does not add duplicate key and exact context', () => {
      const store = new Bufferable(new Writable({}))

      store.track('a', 'hello', { exact: true })
      store.track('a', 'hello', { exact: true })

      expect(store.contexts['a']).toEqual([{ value: 'hello', exact: true }])
    })
  })

  describe('close', () => {
    test('never decreases depth below 0', () => {
      const store = new Bufferable(new Writable({}))

      store.close()
      store.close()
      store.close()

      expect(store.depth).toEqual(0)
    })

    test('decreases depth by 1', () => {
      const store = new Bufferable(new Writable({}))

      store.depth = 1
      store.close()

      expect(store.depth).toEqual(0)
    })
  })

  describe('isTracking', () => {
    test('returns true if tracking everything', () => {
      const store = new Bufferable(new Writable({}), undefined, true)

      expect(store.isTracking('a')).toBeTruthy()
    })

    test('returns false if no name provided and key is not in tracked keys set', () => {
      const store = new Bufferable(new Writable({}))

      expect(store.isTracking('a')).toBeFalsy()
    })

    test('returns true for true context with existing tracked context', () => {
      const store = new Bufferable(new Writable({}))

      store.track('a', 'hello')

      expect(store.isTracking('a', true)).toBeTruthy()
    })

    test('returns false for true context with no existing tracked context', () => {
      const store = new Bufferable(new Writable({}))

      expect(store.isTracking('a', true)).toBeFalsy()
    })

    test('returns false for false context with existing tracked context', () => {
      const store = new Bufferable(new Writable({}))

      store.track('a', 'hello')

      expect(store.isTracking('a', false)).toBeFalsy()
    })

    test('returns true if provided context is an exact match in tracked contexts', () => {
      const store = new Bufferable(new Writable({}))

      store.track('a', 'hello', { exact: true })

      expect(store.isTracking('a', 'hello')).toBeTruthy()
    })

    test('returns false if provided context is not an exact match in tracked contexts', () => {
      const store = new Bufferable(new Writable({}))

      store.track('a', 'hello', { exact: true })

      expect(store.isTracking('a', 'ello')).toBeFalsy()
    })

    test('returns true if provided context is a loose match in tracked contexts', () => {
      const store = new Bufferable(new Writable({}))

      store.track('a', 'hello', { exact: false })

      expect(store.isTracking('a', 'he')).toBeTruthy()
    })
  })
})
