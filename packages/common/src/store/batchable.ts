import { cloneObject } from '../utils/clone-object'
import { deepFilter } from '../utils/deep-filter'
import { noop } from '../utils/noop'

import type { Subscriber, Unsubscriber } from './types'
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
 * Batchable.
 */
export class Batchable<
  TStores extends Record<string, Writable<any, any>>,
  TValues extends StoresValues<TStores> = StoresValues<TStores>,
> {
  /**
   * Stores to batch updates from.
   */
  stores: TStores

  /**
   * All updates to keys in this set will trigger updates, regardless of the context.
   * If undefined, then all keys will trigger updates.
   */
  keys?: Set<PropertyKey> | undefined = undefined

  /**
   * Updates to keys in this object will only trigger updates if they're paired with a matching context.
   */
  trackedContexts: { [K in keyof TStores]?: TrackedContext[] } = {}

  /**
   * The current value of the store.
   */
  value: TValues

  /**
   * Accessing keys under the proxy will cause them to be tracked.
   */
  proxy: TValues

  /**
   * The writable store that will be updated when the batchable store is flushed.
   */
  writable: Writable<TValues, string[] | boolean>

  /**
   * Whether the store is currently queued for an update.
   */
  pending = 0

  /**
   * The number of times the store has been primed. Notifications can only occur when the depth is 0.
   */
  depth = 0

  /**
   * All notifications from subscribed stores will be buffered prior to triggering updates from this store.
   */
  bufferedUpdates: BufferedUpdate[] = []

  /**
   * Functions to run when after all subscribers unsubscribe.
   */
  unsubscribers: Unsubscriber[] = []

  /**
   * Stores that are children of this store.
   * Children are just synchronized with the parent's primed state and flushes.
   */
  children = new Set<Batchable<any, any>>()

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
   * Subscribe.
   */
  subscribe(run: Subscriber<TValues>, invalidate = noop, runFirst = true) {
    return this.writable.subscribe(run, invalidate, runFirst)
  }

  startStopNotifier() {
    this.start()
    return this.stop.bind(this)
  }

  /**
   * Runs after this store receives its first subscriber.
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
   * Runs after this store's last subscriber unsubscribes.
   */
  stop() {
    this.unsubscribers.forEach((unsubscriber) => unsubscriber())
    this.unsubscribers = []
    this.depth = 0
  }

  /**
   * Every store is subscribed to, and notifications from all stores selectively trigger updates.
   */
  subscriptionFunction(i: number, key: keyof TStores, value: any, context?: string[]) {
    /**
     * TODO: figure out if changes can work with direct modification.
     */
    this.value[key as keyof typeof this.value] = value
    this.pending &= ~(1 << i)
    this.bufferedUpdates.push({ key: key as string, context: context })
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
   * Open the buffer, preventing updates until the buffer is fully closed and flushed.
   */
  open() {
    this.depth++

    this.children.forEach((child) => child.open())
  }

  close() {
    if (this.depth <= 0) {
      this.depth = 0
    } else {
      this.depth--
    }

    this.children.forEach((child) => child.close())
  }

  /**
   * Flush the buffer and attempt to notify subscribers.
   */
  flush(force = false) {
    this.close()
    this.notify(force)

    this.children.forEach((child) => child.flush(force))
  }

  /**
   * Attempt to notify subscribers.
   */
  notify(force = false) {
    if (force || this.shouldUpdate()) {
      this.value = { ...this.value }
      this.writable.set(this.value)
      this.bufferedUpdates = []
    }
  }

  /**
   * Whether the store should trigger updates.
   */
  shouldUpdate(): boolean {
    return this.depth === 0 && !this.pending && this.keyChangedInBuffer()
  }

  /**
   * Whether any key in the buffer is being tracked. If true, then an update can be triggered.
   */
  keyChangedInBuffer(): boolean {
    const keysChangedByRoot = this.bufferedUpdates.some((k) => this.keys?.has(k.key))

    if (keysChangedByRoot) {
      return true
    }

    const keysChangedByContext = this.bufferedUpdates.some((keyChanged) => {
      return this.isTracking(keyChanged.key, keyChanged.context)
    })

    return keysChangedByContext
  }

  /**
   * Whether any child is tracking the given key and context.
   */
  childIsTracking(key: string, name?: string[] | boolean): boolean {
    return Array.from(this.children).some((clone) => clone.isTracking(key, name))
  }

  /**
   * Whether the given key and context are being tracked by this store.
   */
  isTracking(key: string, name?: string[] | boolean): boolean {
    if (this.keys == null) {
      return true
    }

    const rootIsTracking = this.keys.has(key)

    if (rootIsTracking || name == null) {
      return rootIsTracking
    }

    if (typeof name === 'boolean') {
      return name && this.trackedContexts[key] != null
    }

    const nameArray = Array.isArray(name) ? name : [name]

    const nameAndContextAreTracked = nameArray.some((n) => {
      return this.trackedContexts[key]?.some((trackedContext) => {
        return trackedContext.exact
          ? n === trackedContext.value
          : n.includes(trackedContext.value) || trackedContext.value.includes(n)
      })
    })

    return nameAndContextAreTracked
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
    const force = this.keyChangedInBuffer()

    this.flush(force)
  }

  /**
   * Track a specific context of a store.
   */
  track(key: keyof TStores, name?: string | string[], options?: Partial<TrackedContext>): void {
    if (name == null) {
      this.keys ??= new Set()
      this.keys.add(key)
      return
    }

    this.trackedContexts[key] ??= []

    const nameArray = Array.isArray(name) ? name : [name]

    const alreadyTracked = nameArray.every(
      (n) => this.trackedContexts[key]?.some((k) => k.value === n && k.exact === options?.exact),
    )

    if (alreadyTracked) {
      return
    }

    this.trackedContexts[key]?.push(...nameArray.map((n) => ({ value: n, ...options })))
  }

  /**
   * Creates and links a child.
   */
  clone(keys: Set<PropertyKey> | undefined = undefined): Batchable<TStores, TValues> {
    const batchable = new Batchable(this.stores, keys, this.value)

    this.children.add(batchable)

    return batchable
  }

  /**
   * Track a specific context of all stores.
   */
  createTrackingProxy(
    name?: string | string[],
    options?: Partial<TrackedContext>,
    filter = true,
  ): TValues {
    const proxy = {} as TValues

    for (const key in this.value) {
      Object.defineProperty(proxy, key, {
        get: () => {
          this.track(key, name, options)
          return filter
            ? deepFilter(this.value[key as keyof typeof this.value], name)
            : this.value[key as keyof typeof this.value]
        },
        enumerable: true,
      })
    }

    return proxy
  }
}
