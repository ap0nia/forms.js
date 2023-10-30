import { cloneObject } from '../utils/clone-object'

import { Bufferable, type BufferedUpdate, type StoresValues } from './bufferable'
import type { Unsubscriber } from './types'
import { Writable } from './writable'

/**
 * A batchable is a store that subscribes to multiple stores and selectively notifies subscribers,
 * i.e. batching the updates from all the stores.
 */
export class Batchable<
  TStores extends Record<string, Writable<any, any>>,
  TValues extends StoresValues<TStores> = StoresValues<TStores>,
> extends Bufferable<TStores, TValues> {
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

    const startStopNotifier = () => {
      Object.entries(stores).forEach(([key, store], i) => {
        const unsubscriber = store.subscribe(
          this.subscriptionFunction.bind(this, i, key),
          this.invalidateFunction.bind(this, i),
          false,
        )
        this.unsubscribers.push(unsubscriber)
      })

      return () => {
        this.unsubscribers.forEach((unsubscriber) => unsubscriber())
        this.unsubscribers = []
      }
    }

    super(new Writable(value, startStopNotifier), keys, all)

    this.stores = stores
  }

  /**
   * This store maintains and builds its own buffer while its open.
   */
  override notify(force = false) {
    super.notify(force, this.buffer)
  }

  /**
   * This store maintains and builds its own buffer while its open.
   */
  override flush(force = false) {
    super.flush(force, this.buffer)
  }

  /**
   * Every store is subscribed to, and notifications from all stores selectively trigger updates.
   */
  subscriptionFunction(i: number, key: string, value: any, context?: string[]) {
    this.writable.value[key as keyof TValues] = value

    this.pending &= ~(1 << i)

    this.buffer.push({ key, context })

    this.notify()
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
    super.open()

    fn()

    /**
     * After a transaction, the depth it was done doesn't matter.
     * Only whether the buffer has relevant, queued updates matters.
     */
    const force = this.keyChangedInBuffer(this.buffer)

    this.flush(force)
  }
}
