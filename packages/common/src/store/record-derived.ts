import { cloneObject } from '../utils/clone-object'
import { deepFilter } from '../utils/deep-filter'
import { noop } from '../utils/noop'

import type { StoresValues } from './derived'
import type { Subscriber, Unsubscriber } from './types'
import { Writable } from './writable'

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
  TStores extends Record<string, Writable<any, any>>,
  TValues extends StoresValues<TStores> = StoresValues<TStores>,
> {
  /**
   * An object mapping keys to stores.
   */
  stores: TStores

  /**
   * The keys associated with the corresponding stores that can trigger updates.
   *
   * If undefined, all stores will trigger updates.
   * If defined, only stores associated with the keys in the set will trigger updates.
   */
  keys?: Set<PropertyKey>

  /**
   * Internally, a writable is used to handle the subscription logic.
   *
   * The context provided when setting or updating a value can be an array of string names,
   * which will be used in a lookup in {@link keyNames} for fine-tuned update logic,
   * or a boolean to explicitly force or prevent an update.
   *
   * @internal
   */
  writable: Writable<TValues, string[] | boolean>

  /**
   * The most recently calculated value.
   */
  value: TValues

  /**
   * {@link keys} can be mutated by accessing certain properties on this proxy instead of directly.
   */
  proxy: TValues

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
  keyNames: { [K in keyof TStores]?: { value: string; exact?: boolean }[] } = {}

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

  /**
   */
  clones = new Set<RecordDerived<any, any>>()

  constructor(
    stores: TStores,
    keys: Set<PropertyKey> | undefined = undefined,
    defaultValue?: TValues,
  ) {
    this.stores = stores

    this.keys = keys

    this.value =
      defaultValue ??
      Object.entries(stores).reduce((acc, [key, store]) => {
        acc[key as keyof typeof acc] = cloneObject(store.value)
        return acc
      }, {} as TValues)

    this.proxy = {} as TValues

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

    if (noKeys || (key && this.keys?.has(key)) || this.isTracking(key, context)) {
      this.writable.set(this.value)
    }
  }

  /**
   * Subscribe.
   */
  subscribe(run: Subscriber<TValues>, invalidate = noop, runFirst = true) {
    return this.writable.subscribe(run, invalidate, runFirst)
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
    Object.entries(this.stores).forEach(([key, store]: [keyof TStores, Writable<any, any>], i) => {
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
  subscriptionFunction(i: number, key: keyof TStores, value: any, context?: string[]) {
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

    this.clones.forEach((clone) => {
      clone.rimeTrauma += 1
      clone.keysChangedDuringFrozen = []
    })
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
    this.clones.forEach((clone) => {
      clone.unfreeze(shouldNotify)
    })

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
      return this.isTracking(keyChanged.key, keyChanged.name)
    })

    // console.log(this.keysChangedDuringFrozen, this.keys)
    // console.log({ trackedNamesChanged })

    if (shouldNotify === true || noKeys || trackedKeysChanged || trackedNamesChanged) {
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
  track(key: keyof TStores, name?: string | string[], options?: { exact?: boolean }) {
    this.keyNames[key] ??= []

    if (name == null) {
      this.keys ??= new Set()
      this.keys.add(key)
      return
    }

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
   * Create and link another {@link RecordDerived} with this one so they share frozen/unfrozen state.
   */
  clone(keys: Set<PropertyKey> | undefined = undefined) {
    const newDerived = new RecordDerived(this.stores, keys, this.value)

    this.clones.add(newDerived)

    return newDerived
  }

  /**
   * Track a specific context of all stores.
   */
  createTrackingProxy(name?: string | string[], options?: { exact?: boolean }) {
    const proxy = {} as TValues

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

  /**
   * Whether a key and/or contextual name is tracked by this store.
   */
  isTracking(key: string, name?: string[] | boolean): boolean {
    if (this.keys == null) {
      return true
    }

    if (name == null) {
      return this.keys.has(key)
    }

    if (typeof name === 'boolean') {
      return name
    }

    const nameArray = Array.isArray(name) ? name : [name]

    if (
      nameArray.some((n) => {
        return this.keyNames[key]?.some((k) => {
          return k.exact ? n === k.value : n.includes(k.value) || k.value.includes(n)
        })
      })
    ) {
      return true
    }

    return false
  }

  /**
   * Whether any clones are tracking a key and/or contextual name.
   */
  clonesAreTracking(key: string, name?: string[] | boolean): boolean {
    return Array.from(this.clones).some((clone) => clone.isTracking(key, name))
  }
}
