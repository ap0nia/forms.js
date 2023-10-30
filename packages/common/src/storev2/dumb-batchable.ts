import { noop } from '../utils/noop'

import type { Subscriber } from './types'
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
 * A dumb batchable is a store that can selectively notify subscribers when it's manually flushed
 * with buffered updates that contain any keys and/or contexts that are being tracked.
 */
export class DumbBatchable<
  TStores extends Record<string, Writable<any, any>>,
  TValues extends StoresValues<TStores> = StoresValues<TStores>,
> {
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
   * The number of times the buffer has been opened.
   * Notifications can only occur when the buffer has been fully closed.
   */
  depth = 0

  constructor(
    writable = new Writable<TValues, string[] | boolean>(),
    keys = new Set<PropertyKey>(),
    all = false,
  ) {
    this.keys = keys
    this.all = all
    this.writable = writable
  }

  /**
   * Subscribe.
   */
  subscribe(run: Subscriber<TValues>, invalidate = noop, runFirst = true) {
    return this.writable.subscribe(run, invalidate, runFirst)
  }

  /**
   * Open the buffer, preventing updates until the buffer is fully closed and flushed.
   */
  open() {
    this.depth++
  }

  /**
   */
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
  flush(force = false, buffer = new Array<BufferedUpdate>()) {
    this.close()
    this.notify(force, buffer)
  }

  /**
   * Attempt to notify subscribers.
   */
  notify(force = false, buffer = new Array<BufferedUpdate>()) {
    if (force || this.shouldUpdate(buffer)) {
      this.writable.update((value) => ({ ...value }))
    }
  }

  /**
   * Whether the store should trigger updates.
   */
  shouldUpdate(buffer: BufferedUpdate[]): boolean {
    return this.depth === 0 && this.keyChangedInBuffer(buffer)
  }

  /**
   * Whether any key in the buffer is being tracked. If true, then an update can be triggered.
   */
  keyChangedInBuffer(buffer: BufferedUpdate[]): boolean {
    const keysChangedByRoot = buffer.some((k) => this.keys?.has(k.key))

    if (keysChangedByRoot) {
      return true
    }

    const keysChangedByContext = buffer.some((keyChanged) => {
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

    const nameAndContextAreTracked = name.some((n) => {
      return this.contexts[key]?.some((trackedContext) => {
        return trackedContext.exact
          ? n === trackedContext.value
          : n.includes(trackedContext.value) || trackedContext.value.includes(n)
      })
    })

    return nameAndContextAreTracked
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
