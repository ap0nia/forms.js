import { cloneObject } from '../utils/clone-object'
import { deepFilter } from '../utils/deep-filter'
import { noop } from '../utils/noop'

import type { Subscriber, Unsubscriber } from './types'
import { Writable } from './writable'

/**
 * Translates a record of stores into a record of their values.
 */
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
   * Whether to track updates from all stores.
   */
  all: boolean

  /**
   * All updates to keys in this set will trigger updates, regardless of the context.
   */
  keys: Set<PropertyKey>

  /**
   * Updates to keys in this object will only trigger updates if they're paired with a matching context.
   */
  contexts: { [K in keyof TStores]?: TrackedContext[] } = {}

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
  buffer: BufferedUpdate[] = []

  /**
   * Functions to run when after all subscribers unsubscribe.
   */
  unsubscribers: Unsubscriber[] = []

  /**
   * Stores that are children of this store.
   * Children are just synchronized with the parent's primed state and flushes.
   */
  children = new Set<Batchable<any, any>>()

  constructor(stores: TStores, keys = new Set<PropertyKey>(), all = false) {
    this.stores = stores

    this.keys = keys

    this.all = all

    this.writable = new Writable(
      Object.entries(stores).reduce((acc, [key, store]) => {
        acc[key as keyof typeof acc] = cloneObject(store.value)
        return acc
      }, {} as TValues),
      this.start.bind(this),
    )

    this.proxy = this.createTrackingProxy(undefined, undefined, false)
  }

  /**
   * Proxy over the writable store's value.
   */
  get value() {
    return this.writable.value
  }

  /**
   * Subscribe.
   */
  subscribe(run: Subscriber<TValues>, invalidate = noop, runFirst = true) {
    return this.writable.subscribe(run, invalidate, runFirst)
  }

  /**
   * Runs when this store receives its first subscriber.
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

    return this.stop.bind(this)
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
    this.writable.value[key as keyof TValues] = value
    this.pending &= ~(1 << i)
    this.buffer.push({ key: key as string, context: context })
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

  /**
   */
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
      this.writable.update((value) => ({ ...value }))
      this.buffer = []
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
    const keysChangedByRoot = this.buffer.some((k) => this.keys.has(k.key))

    if (keysChangedByRoot) {
      return true
    }

    const keysChangedByContext = this.buffer.some((keyChanged) => {
      return this.isTracking(keyChanged.key, keyChanged.context)
    })

    return keysChangedByContext
  }

  /**
   * Whether any child is tracking the given key and context.
   */
  childIsTracking(key: string, name?: string[] | boolean): boolean {
    return Array.from(this.children).some((child) => child.isTracking(key, name))
  }

  /**
   * Whether the given key and context are being tracked by this store.
   */
  isTracking(key: string, name?: string | string[] | boolean): boolean {
    if (this.all === true) {
      return true
    }

    const rootIsTracking = this.keys.has(key)

    if (rootIsTracking || name == null) {
      return rootIsTracking
    }

    if (typeof name === 'boolean') {
      return name && this.contexts[key] != null
    }

    const nameArray = Array.isArray(name) ? name : [name]

    const nameAndContextAreTracked = nameArray.some((n) => {
      return this.contexts[key]?.some((trackedContext) => {
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
     * After a transaction, force an update if the buffer contains relevant updates.
     */
    this.flush(this.keyChangedInBuffer())
  }

  /**
   * Track a specific context of a store.
   */
  track(key: keyof TStores, name?: string | string[], options?: Partial<TrackedContext>): void {
    if (name == null) {
      this.keys.add(key)
      return
    }

    this.contexts[key] ??= []

    const nameArray = Array.isArray(name) ? name : [name]

    this.contexts[key]?.push(
      ...nameArray
        .filter(
          (n) => !this.contexts[key]?.some((c) => c.value === n && c.exact === options?.exact),
        )
        .map((n) => ({ value: n, ...options })),
    )
  }

  /**
   * Creates and links a child.
   */
  clone(keys = new Set<PropertyKey>()): Batchable<TStores, TValues> {
    const child = new Batchable<TStores, TValues>(this.stores, keys, this.all)
    this.children.add(child)
    return child
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

    for (const key in this.stores) {
      Object.defineProperty(proxy, key, {
        get: () => {
          this.track(key, name, options)
          return filter
            ? deepFilter(this.writable.value[key as keyof TValues], name)
            : this.writable.value[key as keyof TValues]
        },
        enumerable: true,
      })
    }

    return proxy
  }
}
