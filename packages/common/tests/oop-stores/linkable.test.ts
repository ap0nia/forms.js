import { describe, test, expect, vi } from 'vitest'

import { Linkable } from '../../src/oop-stores/linkable'
import { Writable } from '../../src/oop-stores/writable'

function createStores(set?: Set<string>, all = false) {
  const writables = {
    a: new Writable(1),
    b: new Writable(2),
    c: new Writable(3),
  }

  const linkable = new Linkable(writables, set, all)

  return { writables, linkable }
}

describe('Linkable', () => {
  describe('properly links open state with children', () => {
    test('child notifies after flushing even if parent does not notify', () => {
      // Parent tracks no changes.
      const { linkable, writables } = createStores()

      const parentFn = vi.fn()

      linkable.subscribe(parentFn, undefined, false)

      // Child tracks all changes.
      const child = linkable.clone(undefined, true)

      const childFn = vi.fn()

      child.subscribe(childFn, undefined, false)

      linkable.open()

      writables.a.set(4)
      writables.b.set(4)
      writables.c.set(4)

      linkable.flush()

      expect(parentFn).not.toHaveBeenCalled()
      expect(childFn).toHaveBeenLastCalledWith({ a: 4, b: 4, c: 4 })
    })

    test('child does not notify even if parent notifies', () => {
      // Parent tracks all changes.
      const { linkable, writables } = createStores(undefined, true)

      const parentFn = vi.fn()

      linkable.subscribe(parentFn, undefined, false)

      // Child tracks no changes.
      const child = linkable.clone(undefined, false)

      const childFn = vi.fn()

      child.subscribe(childFn, undefined, false)

      linkable.open()

      writables.a.set(4)
      writables.b.set(4)
      writables.c.set(4)

      expect(childFn).not.toHaveBeenCalled()

      linkable.flush()

      expect(parentFn).toHaveBeenLastCalledWith({ a: 4, b: 4, c: 4 })
      expect(childFn).not.toHaveBeenCalled()
    })
  })
})
