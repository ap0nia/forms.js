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
   *
   * This is useful for batch updating.
   *
   * i.e. Update many of the stores, then notify subscribers once after all the changes.
   */
  frozen = false

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

    if (this.frozen) {
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

    this.frozen = false
  }

  /**
   * Cleanup this store by removing all of its listeners.
   */
  stop() {
    this.unsubscribers.forEach((unsubscriber) => unsubscriber())
    this.unsubscribers = []
    this.frozen = true
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

  freeze() {
    this.frozen = true
  }

  unfreeze() {
    this.frozen = false
    this.notify()
  }

  /**
   * Any operations that occur during a transaction will not trigger updates.
   * After the transaction is complete, the store will be forcefully updated once.
   */
  transaction(fn: () => void) {
    this.frozen = true

    this.keysChangedDuringFrozen = []

    fn()

    // type-guarding doesn't work on the object property for some reason.
    const keys = this.keys

    if (keys == null || this.keysChangedDuringFrozen.some((k) => keys.has(k))) {
      this.writable.set(this.value)
    }
  }
}
