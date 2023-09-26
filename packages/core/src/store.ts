/**
 * Based on Svelte's implementation of stores.
 *
 * @see https://github.com/sveltejs/svelte/blob/master/packages/svelte/src/runtime/store/index.js
 */

import { noop, type Noop } from './utils/noop'
import { safeNotEqual } from './utils/safe-not-equal'

export class Writable<T> {
  /**
   * Subscribe functions paired with a value to be passed to them.
   * Populated by {@link Writable.set} to update subscribers.
   */
  static subscriberQueue: [Subscriber<any>, unknown][] = []

  stop?: Noop

  subscribers = new Set<SubscribeInvalidateTuple<T>>()

  value: T

  start: StartStopNotifier<T>

  constructor(value?: T, start: StartStopNotifier<T> = noop) {
    this.value = value as T
    this.start = start
  }

  public get hasSubscribers(): boolean {
    return this.subscribers.size > 0
  }

  public subscribe(run: Subscriber<T>, invalidate = noop) {
    const subscriber: SubscribeInvalidateTuple<T> = [run, invalidate]

    this.subscribers.add(subscriber)

    if (this.subscribers.size === 1) {
      this.stop = this.start(this.set.bind(this), this.update.bind(this)) ?? noop
    }

    run(this.value as T)

    return () => {
      this.subscribers.delete(subscriber)

      if (this.subscribers.size === 0 && this.stop != null) {
        this.stop()
        this.stop = undefined
      }
    }
  }

  public update(updater: Updater<T>) {
    this.set(updater(this.value as T))
  }

  public quietUpdate(updater: Updater<T>): void {
    this.quietSet(updater(this.value as T))
  }

  public set(value: T): void {
    const changed = this.quietSet(value)

    if (changed) {
      this.notify(value)
    }
  }

  /**
   * Set the value without notifying subscribers.
   *
   * @returns Whether the value changed.
   */
  public quietSet(value: T): boolean {
    if (!safeNotEqual(this.value, value)) {
      return false
    }

    this.value = value

    return true
  }

  public notify(value: T): void {
    if (this.stop == null) {
      return
    }

    const shouldRunQueue = Writable.subscriberQueue.length > 0

    this.subscribers.forEach(([subscribe, invalidate]) => {
      invalidate()
      Writable.subscriberQueue.push([subscribe, value])
    })

    if (shouldRunQueue) {
      Writable.subscriberQueue.forEach(([subscriber, value]) => {
        subscriber(value)
      })
      Writable.subscriberQueue.length = 0
    }
  }
}

/**
 * An updater function receives the current value of a store, and returns the new value.
 */
export type Updater<T> = (value: T) => T

/**
 * A subscriber will receive the current value of a store whenever it changes.
 */
export type Subscriber<T> = (value: T) => void

/**
 * Called when a value will change.
 */
export type Invalidator<T> = (value?: T) => void

/**
 * Subscribers/invalidators come in pairs.
 */
export type SubscribeInvalidateTuple<T> = [Subscriber<T>, Invalidator<T>]

/**
 * Start and stop notification callbacks.
 * Called when the first subscriber subscribes;
 * can return a function that's called when when the last subscriber unsubscribes.
 */
export type StartStopNotifier<T> = (set: Setter<T>, update: UpdateUpdater<T>) => void | Noop

/**
 * A setter function updates the value of a store.
 */
export type Setter<T> = (value: T) => void

/**
 * Not sure what this should be named. It's the second param in {@link StartStopNotifier}.
 */
export type UpdateUpdater<T> = (updater: Updater<T>) => unknown
