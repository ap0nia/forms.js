import { cloneObject } from '../utils/clone-object'

import { DumbBatchable } from './dumb-batchable'
import type { Unsubscriber } from './types'
import { Writable } from './writable'

export type StoresValues<T> = T extends Writable<infer U>
  ? U
  : { [K in keyof T]: T[K] extends Writable<infer U> ? U : never }

/**
 * A buffered update contains information about the store that changed.
 * The value is not needed because it's set directly without triggering an update.
 */
export type BufferedUpdate = {
  /**
   * The key of the store that changed.
   */
  key: string

  /**
   * The context provided with the updated value, if any.
   */
  context?: string[] | boolean
}

/**
 * Updates to a certain store can be filtered by those accompanied by a specific context.
 */
export type TrackedContext = {
  /**
   * The value of the context. e.g. the name of a form field that changed.
   */
  value: string

  /**
   * Whether the context must match exactly or if it can be a subset of the context or vice versa.
   */
  exact?: boolean
}

/**
 * A batchable is a store that subscribes to multiple stores and selectively notifies subscribers,
 * i.e. batching the updates from all the stores.
 */
export class Batchable<
  TStores extends Record<string, Writable<any, any>>,
  TValues extends StoresValues<TStores> = StoresValues<TStores>,
> extends DumbBatchable<TStores, TValues> {
  /**
   * Stores to batch updates from.
   */
  stores: TStores

  /**
   * Notifications from subscribed stores can be buffered to prevent notifications from this store.
   */
  buffer: BufferedUpdate[] = []

  /**
   * Unsubscribe functions for all the stores in the provided object.
   */
  unsubscribers: Unsubscriber[] = []

  /**
   * Whether the store is currently queued for an update.
   */
  pending = 0

  constructor(stores: TStores, keys = new Set<PropertyKey>(), all = false) {
    const value = Object.entries(stores).reduce((acc, [key, store]) => {
      acc[key as keyof typeof acc] = cloneObject(store.value)
      return acc
    }, {} as TValues)

    super(new Writable(value), keys, all)

    this.stores = stores
  }

  override startStopNotifier() {
    this.start()
    return super.startStopNotifier()
  }

  /**
   * Runs after this store receives its first subscriber.
   */
  start() {
    Object.entries(this.stores).forEach(([key, store], i) => {
      const unsubscriber = store.subscribe(
        this.subscriptionFunction.bind(this, i, key),
        this.invalidateFunction.bind(this, i),
        false,
      )
      this.unsubscribers.push(unsubscriber)
    })
  }

  override stop() {
    this.unsubscribers.forEach((unsubscriber) => unsubscriber())
    this.unsubscribers = []
    super.stop()
  }

  /**
   * Every store is subscribed to, and notifications from all stores selectively trigger updates.
   */
  subscriptionFunction(i: number, key: string, value: any, context?: string[]) {
    this.writable.value[key as keyof TValues] = value
    this.pending &= ~(1 << i)
    this.buffer.push({ key, context })
    this.notify(this.buffer)
  }

  /**
   * The invalidation function is called before the subscription function.
   * If not entirely sequential, then pending will be desynchronized and updates will be prevented.
   */
  invalidateFunction(i: number) {
    this.pending |= 1 << i
  }

  /**
   * Run a function and flush the buffer after it completes.
   */
  transaction(fn: () => unknown): void {
    this.open()

    fn()

    /**
     * After a transaction, the depth it was done doesn't matter.
     * Only whether the buffer has relevant, queued updates matters.
     */
    const force = this.keyChangedInBuffer(this.buffer)

    this.flush(this.buffer, force)
  }
}
