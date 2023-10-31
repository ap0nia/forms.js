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

    const createSubscriber = (i: number, key: string) => {
      return (value: any, context?: string[]) => {
        this.writable.value[key as keyof TValues] = value
        this.pending &= ~(1 << i)
        this.buffer.push({ key, context })
        this.notify()
      }
    }

    const createInvalidator = (i: number) => {
      return () => {
        this.pending |= 1 << i
      }
    }

    const startStopNotifier = () => {
      Object.entries(stores).forEach(([key, store], i) => {
        const unsubscribe = store.subscribe(createSubscriber(i, key), createInvalidator(i), false)
        this.unsubscribers.push(unsubscribe)
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
   * Run a function and flush the buffer after it completes.
   */
  transaction(fn: () => unknown): void {
    super.open()

    fn()

    /**
     * After a transaction, force an update if any tracked keys and/or contexts have changed.
     */
    this.flush(this.keyChangedInBuffer(this.buffer))
  }
}

export function createProxy<T extends Record<string, any>>(batchable: Batchable<T>): T {
  const proxy = {} as T

  for (const key in batchable.stores) {
    Object.defineProperty(proxy, key, {
      get: () => {
        batchable.keys.add(key)
        return batchable.writable.value[key]
      },
      enumerable: true,
    })
  }

  return proxy
}
