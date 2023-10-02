import { noop } from '../utils/noop.js'

import type { Subscriber, Unsubscriber } from './types'
import { Writable } from './writable.js'

export type StoresValues<T> = { [K in keyof T]: T[K] extends Writable<infer U> ? U : never }

export class RecordDerived<
  S extends Record<string, Writable<any>>,
  T extends StoresValues<S> = StoresValues<S>,
> {
  writable: Writable<T>

  value: T

  started = false

  pending = 0

  cleanup: Function = noop

  unsubscribers: Unsubscriber[] = []

  constructor(
    public stores: S,
    public keys: Set<keyof S> | undefined = undefined,
  ) {
    this.value = Object.entries(stores).reduce((acc, [key, store]) => {
      acc[key as keyof typeof acc] = store.value
      return acc
    }, {} as T)

    this.writable = new Writable(this.value, (set) => {
      Object.entries(this.stores).forEach(([key, store]: [keyof S, Writable<any>], i) => {
        const unsubscriber = store.subscribe(
          (value) => {
            this.value[key as keyof typeof this.value] = value
            this.pending &= ~(1 << i)
            if (this.started && (this.keys == null || this.keys.has(key))) {
              this.sync(set)
            }
          },
          () => {
            this.pending |= 1 << i
          },
        )

        this.unsubscribers.push(unsubscriber)
      })

      this.started = true

      this.sync(set)

      return this.unsubscribe.bind(this)
    })
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

  sync(set: (value: T) => void) {
    if (this.pending) {
      return
    }

    this.cleanup()

    set(this.value)
  }
}
