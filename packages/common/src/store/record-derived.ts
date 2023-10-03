import { noop } from '../utils/noop.js'

import type { StoresValues } from './derived.js'
import type { Subscriber, Unsubscriber } from './types'
import { Writable } from './writable.js'

/**
 * Given an object with keys mapped to stores, subscribe to all of them, but lazily
 * notify subscribers only whenever certain stores change based on the keys accessed.
 *
 * It uses a {@link Writable} internally to notify subscribers.
 */
export class RecordDerived<
  S extends Record<string, Writable<any>>,
  T extends StoresValues<S> = StoresValues<S>,
> {
  /**
   * An object mapping keys to stores.
   */
  stores: S

  /**
   * The keys of the object indicating which stores to provides updates for.
   */
  keys: Set<PropertyKey> | undefined

  /**
   * The core of this store relies on a regular writable to propagate updates to subscribers.
   */
  writable: Writable<T>

  /**
   * This store maintains its current value as the single source of truth.
   */
  value: T

  /**
   * A proxy can be used instead of the actual value in order to lazily track keys to subscribe to.
   */
  proxy: T

  /**
   * Whether a invalidation is in progress.
   */
  pending = 0

  /**
   * Unsubscribe functions to run after no more subscribers are listening.
   */
  unsubscribers: Unsubscriber[] = []

  /**
   * Whether to forcefully stop updates from occurring.
   * The store can be frozen multiple times, building up rime trauma.
   * It can only notify subscribers once it is fully thawed.
   *
   * This is useful for batch updating.
   */
  rimeTrauma = 0

  /**
   * While frozen, keep track of which keys were accessed.
   * After unfrozen, determine if any keys are being tracked and thus should trigger an update.
   */
  keysChangedDuringFrozen: PropertyKey[] = []

  constructor(stores: S, keys: Set<PropertyKey> | undefined = undefined) {
    this.stores = stores

    this.keys = keys

    this.value = Object.entries(stores).reduce((acc, [key, store]) => {
      acc[key as keyof typeof acc] = structuredClone(store.value)
      return acc
    }, {} as T)

    this.proxy = {} as T

    for (const key in this.value) {
      Object.defineProperty(this.proxy, key, {
        get: () => {
          this.keys ??= new Set()
          this.keys.add(key)
          return this.value[key as keyof typeof this.value]
        },
        enumerable: true,
      })
    }

    this.writable = new Writable(this.value, this.startStopNotifier.bind(this))

    this.notify()
  }

  /**
   * If possible, notify subscribers of the writable store.
   */
  notify(key?: PropertyKey) {
    if (this.pending) {
      return
    }

    if (this.rimeTrauma) {
      if (key) {
        this.keysChangedDuringFrozen.push(key)
      }
    } else {
      this.writable.set(this.value)
    }
  }

  /**
   * Subscribe.
   */
  subscribe(run: Subscriber<T>, invalidate = noop) {
    return this.writable.subscribe(run, invalidate)
  }

  /**
   * When the writable store receives its first subscriber, setup the record-derived store
   * by binding all of its own necessary listeners.
   *
   * When the last subscriber for the writable store unsubscribes, the record-dervied store
   * can remove all of its listeners.
   */
  startStopNotifier() {
    this.start()
    return this.stop.bind(this)
  }

  /**
   * Setup this store by binding listeners to each of the object's stores.
   */
  start() {
    Object.entries(this.stores).forEach(([key, store]: [keyof S, Writable<any>], i) => {
      const unsubscriber = store.subscribe(
        this.subscriptionFunction.bind(this, i, key),
        this.invalidateFunction.bind(this, i),
      )

      this.unsubscribers.push(unsubscriber)
    })
  }

  /**
   * Cleanup this store by removing all of its listeners.
   */
  stop() {
    this.unsubscribers.forEach((unsubscriber) => unsubscriber())
    this.unsubscribers = []
    this.rimeTrauma += 1
  }

  /**
   * Every store will call a version of this function when it updates.
   */
  subscriptionFunction(i: number, key: keyof S, value: any) {
    this.value = { ...this.value, [key]: value }

    this.pending &= ~(1 << i)

    if (this.keys == null || this.keys.has(key)) {
      this.notify(key)
    }
  }

  /**
   * Every store will call a version of this function when it changes.
   */
  invalidateFunction(i: number) {
    this.pending |= 1 << i
  }

  /**
   * Freezing the store causes the rime trauma to increase,
   * which prevents updates from occurring until the store is fully unfrozen.
   */
  freeze() {
    this.rimeTrauma += 1
  }

  /**
   * Unfreezing the store causes the rime trauma to decrease.
   * But no updates will occur until the store is fully unfrozen and rime trauma is 0.
   */
  unfreeze() {
    this.rimeTrauma -= 1

    if (!this.rimeTrauma) {
      this.notify()
    }
  }

  /**
   * Any operations that occur during a transaction will not trigger updates.
   * After the transaction is complete, the store will be forcefully updated once.
   *
   * Ignores rime trauma in order to force the update.
   */
  transaction(fn: () => void) {
    this.rimeTrauma += 1
    this.keysChangedDuringFrozen = []

    fn()

    // type-guarding doesn't work on the object property for some reason.
    const keys = this.keys

    if (keys == null || this.keysChangedDuringFrozen.some((k) => keys.has(k))) {
      this.writable.set(this.value)
    }

    this.rimeTrauma -= 1
    this.keysChangedDuringFrozen = []
  }
}
