import { deepFilter } from '../utils/deep-filter.js'
import { noop } from '../utils/noop.js'

import type { StoresValues } from './derived.js'
import type { Subscriber, Unsubscriber } from './types'
import { Writable } from './writable.js'

export type Context = {
  key: string
  name?: string[] | boolean
  exact?: boolean
}

/**
 * Given an object with keys mapped to stores, subscribe to all of them, but lazily
 * notify subscribers only whenever certain stores change based on the keys accessed.
 *
 * It uses a {@link Writable} internally to notify subscribers.
 */
export class RecordDerived<
  S extends Record<string, Writable<any, any>>,
  T extends StoresValues<S> = StoresValues<S>,
> {
  /**
   * An object mapping keys to stores.
   */
  stores: S

  /**
   * The keys associated with the corresponding stores that can trigger updates.
   *
   * If undefined, all stores will trigger updates.
   * If defined, only stores associated with the keys in the set will trigger updates.
   */
  keys: Set<PropertyKey> | undefined

  /**
   * Internally, a writable is used to handle the subscription logic.
   *
   * The context provided when setting or updating a value can be an array of string names,
   * which will be used in a lookup in {@link keyNames} for fine-tuned update logic,
   * or a boolean to explicitly force or prevent an update.
   *
   * @internal
   */
  writable: Writable<T, string[] | boolean>

  /**
   * The most recently calculated value.
   */
  value: T

  /**
   * {@link keys} can be mutated by accessing certain properties on this proxy instead of directly.
   */
  proxy: T

  /**
   * Whether a invalidation is in progress.
   */
  pending = 0

  /**
   * Instead of subscribing to all updates associated with a key,
   * can subscribe to specific updates based on the context provided when setting or updating a value.
   *
   * For example, instead of updating whenever **any** errors change,
   * only update when the errors for the "test" field change.
   */
  keyNames: { [K in keyof S]?: { value: string; exact?: boolean }[] } = {}

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
  keysChangedDuringFrozen?: Context[] = undefined

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
  }

  /**
   * If possible, notify subscribers of the writable store.
   */
  notify(key?: string, context?: string[] | boolean) {
    if (this.pending) {
      return
    }

    if (this.rimeTrauma) {
      if (key) {
        this.keysChangedDuringFrozen ??= []
        this.keysChangedDuringFrozen.push({ key, name: context })
      }
      return
    }

    if (context === false) {
      return
    }

    // If no keys or context are provided to filter by, notify all subscribers.
    const noKeys = key == null || context === true || this.keys == null

    // Whether the key is being tracked and should trigger an update.
    const isKeyTracked = key && this.keys?.has(key)

    // Whether a specific contextual name is being tracked under the key.
    const isNameTracked =
      key &&
      Array.isArray(context) &&
      context?.some((name) => {
        return this.keyNames[key]?.some((keyName) => {
          return keyName.exact
            ? name === keyName.value
            : name.includes(keyName.value) || keyName.value.includes(name)
        })
      })

    if (noKeys || isKeyTracked || isNameTracked) {
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
    Object.entries(this.stores).forEach(([key, store]: [keyof S, Writable<any, any>], i) => {
      const unsubscriber = store.subscribe(
        this.subscriptionFunction.bind(this, i, key),
        this.invalidateFunction.bind(this, i),
        false,
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
    this.rimeTrauma = 0
  }

  /**
   * Every store will call a version of this function when it updates.
   */
  subscriptionFunction(i: number, key: keyof S, value: any, context?: string[]) {
    this.value = { ...this.value, [key]: value }
    this.pending &= ~(1 << i)
    this.notify(key as string, context)
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
    this.keysChangedDuringFrozen = []
  }

  /**
   * Unfreezing the store causes the rime trauma to decrease.
   * But no updates will occur until the store is fully unfrozen and rime trauma is 0.
   *
   * @param shouldNotify Whether to notify subscribers if the store is fully unfrozen.
   *
   * If shouldNotify is undefined, the default behavior is to notify if the store is fully unfrozen.
   *
   * @remarks Logic is slightly different from regular notifications.
   */
  unfreeze(shouldNotify?: boolean) {
    this.thaw()

    if (shouldNotify === false || ((this.rimeTrauma || this.pending) && shouldNotify == null)) {
      return
    }

    // No keys to filter by, so notify all subscribers.
    const noKeys = this.keys == null

    // Whether tracked keys were changed.
    const trackedKeysChanged = this.keysChangedDuringFrozen?.some((k) => this.keys?.has(k.key))

    // Whether specific contextual names were changed.
    const trackedNamesChanged = this.keysChangedDuringFrozen?.some((keyChanged) => {
      if (typeof keyChanged.name === 'boolean') {
        return keyChanged.name
      }
      return keyChanged.name?.some((name) => {
        return this.keyNames[keyChanged.key]?.some((keyName) => {
          return keyName.exact
            ? name === keyName.value
            : name.includes(keyName.value) || keyName.value.includes(name)
        })
      })
    })

    if (noKeys || trackedKeysChanged || trackedNamesChanged) {
      this.writable.set(this.value)
    }

    this.keysChangedDuringFrozen = undefined
  }

  /**
   * Decrements the rime trauma by 1 if possible.
   */
  thaw() {
    if (this.rimeTrauma <= 0) {
      this.rimeTrauma = 0
    } else {
      this.rimeTrauma -= 1
    }
  }

  /**
   * Any operations that occur during a transaction will not trigger updates.
   * After the transaction is complete, the store will be forcefully updated once.
   *
   * Ignores rime trauma in order to force the update.
   */
  transaction(fn: () => unknown) {
    this.rimeTrauma += 1
    this.keysChangedDuringFrozen = []

    fn()

    if (this.keys == null || this.keysChangedDuringFrozen.some((k) => this.keys?.has(k.key))) {
      this.writable.set(this.value)
    }

    this.thaw()
    this.keysChangedDuringFrozen = []
  }

  /**
   * Track a specific contextual name of a key, instead of all updates to that key's store.
   */
  track(key: keyof S, name: string | string[], options?: { exact?: boolean }) {
    this.keyNames[key] ??= []

    const names = Array.isArray(name) ? name : [name]

    // If all names have already been tracked, do nothing.
    if (
      names.every(
        (n) => this.keyNames[key]?.some((k) => k.value === n && k.exact === options?.exact),
      )
    ) {
      return
    }

    this.keyNames[key]?.push(...names.map((n) => ({ value: n, ...options })))
  }

  /**
   */
  createTrackingProxy(name: string | string[], options?: { exact?: boolean }) {
    const proxy = {} as T

    for (const key in this.value) {
      Object.defineProperty(proxy, key, {
        get: () => {
          this.track(key, name, options)
          return deepFilter(this.value[key as keyof typeof this.value], name)
        },
        enumerable: true,
      })
    }

    return proxy
  }
}
