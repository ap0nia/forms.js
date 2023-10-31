/**
 * Based on Svelte's implementation of stores.
 *
 * @see https://github.com/sveltejs/svelte/blob/master/packages/svelte/src/runtime/store/index.js
 */

import { noop, type Noop } from '../utils/noop'
import { safeNotEqual } from '../utils/safe-not-equal'

import type { Invalidator, Readable, StartStopNotifier, Subscriber, Updater } from './types'

/**
 * A writable store notifies subscribers whenever its value is changed.
 */
export class Writable<T = any, TContext = unknown> implements Readable<T> {
  /**
   * A shared queue for subscriber notifications.
   *
   * Each element is a tuple of [subscriber function, value, context]
   */
  public static readonly subscriberQueue: [Subscriber<any, any>, unknown, unknown?][] = []

  /**
   * Function to run after the first subscriber subscribes. Returns {@link stop} function.
   */
  start: StartStopNotifier<T>

  /**
   * Function to run when all subscribers unsubscribe.
   */
  stop?: Noop

  /**
   * Functions that are called with the store's new value whenever it's changed via {@link set} or {@link update}.
   */
  subscribers = new Set<SubscribeInvalidateTuple<T, TContext>>()

  /**
   * The current value of the store.
   */
  value: T

  constructor(value?: T, start: StartStopNotifier<T> = noop) {
    this.value = value as T
    this.start = start
  }

  /**
   * Update the store's value by receiving its current value and returning the new value.
   */
  public update(updater: Updater<T>, context?: TContext) {
    this.set(updater(this.value as T), context)
  }

  /**
   * Update the store's value by setting it directly.
   */
  public set(value: T, context?: TContext): void {
    if (!safeNotEqual(this.value, value)) {
      return
    }

    this.value = value

    if (this.stop == null) {
      return
    }

    const shouldRunQueue = !Writable.subscriberQueue.length

    for (const [subscribe, invalidate] of this.subscribers) {
      invalidate()
      Writable.subscriberQueue.push([subscribe, value, context])
    }

    if (!shouldRunQueue) {
      return
    }

    for (const [subscribe, value, context] of Writable.subscriberQueue) {
      subscribe(value, context)
    }

    Writable.subscriberQueue.length = 0
  }

  /**
   * Subscribe to the store by providing a function that's called whenever the store's value changes.
   *
   * @remarks It's also called once during the initial subscription.
   */
  public subscribe(run: Subscriber<T, TContext>, invalidate = noop, runFirst = true): Noop {
    const subscriber: SubscribeInvalidateTuple<T, TContext> = [run, invalidate]

    this.subscribers.add(subscriber)

    if (this.subscribers.size === 1) {
      this.stop = this.start(this.set.bind(this), this.update.bind(this)) ?? noop
    }

    if (runFirst) {
      run(this.value, undefined)
    }

    return this.unsubscribe.bind(this, subscriber)
  }

  /**
   * Unsubscribe from the store by providing a tuple used to subscribe to it.
   */
  private unsubscribe(subscriber: SubscribeInvalidateTuple<T, TContext>): void {
    this.subscribers.delete(subscriber)

    if (this.subscribers.size === 0 && this.stop != null) {
      this.stop()
      this.stop = undefined
    }
  }
}

/**
 * Subscribers/invalidators come in pairs.
 */
export type SubscribeInvalidateTuple<T, TContext = undefined> = [
  Subscriber<T, TContext>,
  Invalidator<T>,
]
