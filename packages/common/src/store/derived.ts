import { noop } from '../utils/noop.js'

import type { Readable, Subscriber, Unsubscriber, Updater } from './types'
import { Writable } from './writable'

export type StoresValues<T> = T extends Readable<infer U>
  ? U
  : { [K in keyof T]: T[K] extends Readable<infer U> ? U : never }

export class Derived<
  S extends Readable<any> | [Readable<S>, ...Array<Readable<S>>] | Array<Readable<any>>,
  T = StoresValues<S>,
> implements Readable<T>
{
  writable: Writable<T>

  values: S[] = []

  started = false

  pending = 0

  cleanup: Function = noop

  auto: boolean

  single: boolean

  unsubscribers: Unsubscriber[] = []

  storesArray: Readable<any>[]

  constructor(
    stores: S,
    public fn: (
      value: StoresValues<S>,
      set: (value: T) => void,
      update: (updater: Updater<T>) => void,
    ) => T | Unsubscriber | void,
    public initialValue?: T,
  ) {
    const single = !Array.isArray(stores)

    this.storesArray = single ? [stores] : stores

    if (!this.storesArray.every(Boolean)) {
      throw new Error('derived() expects stores as input, got a falsy value')
    }

    this.single = single

    this.auto = fn.length < 2

    this.writable = new Writable(this.initialValue, (set, update) => {
      this.unsubscribers = this.storesArray.map((store, i) => {
        const unsubscriber = store.subscribe(
          (value) => {
            this.values[i] = value
            this.pending &= ~(1 << i)
            if (this.started) {
              this.sync(set, update)
            }
          },
          () => {
            this.pending |= 1 << i
          },
        )

        return unsubscriber
      })

      this.started = true

      this.sync(set, update)

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

  sync(set: (value: T) => void, update: (updater: Updater<T>) => void) {
    if (this.pending) {
      return
    }

    this.cleanup()

    const value = (this.single ? this.values[0] : this.values) as StoresValues<S>

    const result = this.fn(value, set, update) as T

    if (this.auto) {
      set(result)
    } else {
      this.cleanup = typeof result === 'function' ? result : noop
    }
  }
}
