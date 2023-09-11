/**
 * Based on Svelte's implementation of stores.
 *
 * @see https://github.com/sveltejs/svelte/blob/master/packages/svelte/src/runtime/store/index.js
 */

import { noop, type Noop } from '../utils/noop'
import { safeNotEqual } from '../utils/safe-not-equal'

/**
 * Subscribe functions paired with a value to be passed to them.
 * Populated by {@link Writable.set} to update subscribers.
 */
const subscriberQueue: [Subscriber<any>, unknown][] = []

export class Writable<T> {
  stop?: Noop

  subscribers = new Set<SubscribeInvalidateTuple<T>>()

  constructor(
    private value?: T,
    private start: StartStopNotifier<T> = noop,
  ) {}

  set(value: T): void {
    if (!safeNotEqual(this.value, value)) {
      return
    }

    this.value = value

    if (this.stop == null) {
      return
    }

    const shouldRunQueue = !subscriberQueue.length

    this.subscribers.forEach(([subscribe, invalidate]) => {
      invalidate()
      subscriberQueue.push([subscribe, value])
    })

    if (shouldRunQueue) {
      subscriberQueue.forEach(([subscriber, value]) => {
        subscriber(value)
      })
      subscriberQueue.length = 0
    }
  }

  update(updater: Updater<T>) {
    this.set(updater(this.value as T))
  }

  subscribe(run: Subscriber<T>, invalidate = noop) {
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
