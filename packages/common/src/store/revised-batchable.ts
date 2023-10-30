import { cloneObject } from '../utils/clone-object'
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
   * Whether to track all keys in the store. Shortcut for adding all the keys manually.
   */
  all = false

  /**
   * All updates to keys in this set will trigger updates, regardless of the context.
   * If undefined, then all keys will trigger updates.
   */
  keys = new Set<PropertyKey>()

  /**
   * Updates to keys in this object will only trigger updates if they're paired with a matching context.
   */
  contexts: { [K in keyof TStores]?: TrackedContext[] } = {}

  /**
   * The writable store that will be updated when the batchable store is flushed.
   * It contains the current value of this derived store.
   */
  writable: Writable<TValues, string[] | boolean>

  /**
   * Whether the store is currently queued for an update.
   */
  pending = 0

  /**
   * The number of times the buffer has been opened.
   * Notifications can only occur when the buffer has been fully closed.
   */
  depth = 0

  /**
   * Notifications from subscribed stores can be buffered to prevent notifications from this store.
   */
  buffer: BufferedUpdate[] = []

  /**
   * Unsubscribe functions for all the stores in the provided object.
   */
  unsubscribers: Unsubscriber[] = []

  constructor(stores: TStores, keys = new Set<PropertyKey>(), all = false) {
    this.stores = stores

    this.keys = keys

    this.all = all

    this.writable = new Writable(
      Object.entries(stores).reduce((acc, [key, store]) => {
        acc[key as keyof typeof acc] = cloneObject(store.value)
        return acc
      }, {} as TValues),
      this.startStopNotifier.bind(this),
    )
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
    Object.entries(this.stores).forEach(([key, store], i) => {
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
   * Open the buffer, preventing updates until the buffer is fully closed and flushed.
   */
  open() {
    this.depth++
  }

  close() {
    if (this.depth <= 0) {
      this.depth = 0
    } else {
      this.depth--
    }
  }

  /**
   * Flush the buffer and attempt to notify subscribers.
   */
  flush(force = false) {
    this.close()
    this.notify(force)
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
    const keysChangedByRoot = this.buffer.some((k) => this.keys?.has(k.key))

    if (keysChangedByRoot) {
      return true
    }

    const keysChangedByContext = this.buffer.some((keyChanged) => {
      return this.isTracking(keyChanged.key, keyChanged.context)
    })

    return keysChangedByContext
  }

  /**
   * Whether the given key and context are being tracked by this store.
   */
  isTracking(key: string, name?: string[] | boolean): boolean {
    if (this.all == true) {
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
      this.keys.add(key)
      return
    }

    const nameArray = Array.isArray(name) ? name : [name]

    const alreadyTracked = nameArray.every(
      (n) => this.contexts[key]?.some((k) => k.value === n && k.exact === options?.exact),
    )

    if (alreadyTracked) {
      return
    }

    this.contexts[key] ??= []
    this.contexts[key]?.push(...nameArray.map((n) => ({ value: n, ...options })))
  }
}
