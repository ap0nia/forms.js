import { noop } from '../utils/noop.js'

import type { StoresValues } from './derived.js'
import type { Subscriber, Unsubscriber } from './types'
import { Writable } from './writable.js'

export class RecordDerived<
  S extends Record<string, Writable<any>>,
  T extends StoresValues<S> = StoresValues<S>,
> {
  writable: Writable<T>

  value: T

  proxy: T

  started = false

  pending = 0

  cleanup: Function = noop

  unsubscribers: Unsubscriber[] = []

  key: any

  constructor(
    public stores: S,
    public keys: Set<PropertyKey> | undefined = undefined,
  ) {
    this.value = Object.entries(stores).reduce((acc, [key, store]) => {
      acc[key as keyof typeof acc] = structuredClone(store.value)
      return acc
    }, {} as T)

    this.proxy = {} as T

    for (const key in this.value) {
      Object.defineProperty(this.proxy, key, {
        get: () => {
          this.keys?.add(key)
          return this.value[key as keyof typeof this.value]
        },
        enumerable: true,
      })
    }

    this.writable = new Writable(this.value, () => {
      return this.unsubscribe.bind(this)
    })

    Object.entries(this.stores).forEach(([key, store]: [keyof S, Writable<any>], i) => {
      const unsubscriber = store.subscribe(
        (value) => {
          this.value = { ...this.value, [key]: value }
          this.key = key
          this.pending &= ~(1 << i)
          if (this.started && (this.keys == null || this.keys.has(key))) {
            this.sync()
          }
        },
        () => {
          this.pending |= 1 << i
        },
      )
      this.unsubscribers.push(unsubscriber)
    })

    this.started = true

    this.sync()
  }

  subscribe(run: Subscriber<T>, invalidate = noop) {
    return this.writable.subscribe(run, invalidate)
  }

  unsubscribe() {
    this.unsubscribers.forEach((unsubscriber) => unsubscriber())

    this.cleanup()

    // We need to set this to false because callbacks can still happen despite having unsubscribed:
    // Callbacks might already be placed in the queue which doesn't know it should no longer
    // invoke this derived store.
    this.started = false
  }

  sync() {
    if (this.pending) {
      return
    }

    this.cleanup()

    this.writable.set(this.value)
  }
}
