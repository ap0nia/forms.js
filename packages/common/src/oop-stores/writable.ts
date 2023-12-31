/**
 * Based on Svelte's implementation of stores.
 *
 * @see https://github.com/sveltejs/svelte/blob/master/packages/svelte/src/runtime/store/index.js
 */

import { noop, type Noop } from '../utils/noop'
import { safeNotEqual } from '../utils/safe-not-equal'

import type { Invalidator, Readable, StartStopNotifier, Subscriber, Updater } from './types'

/**
 * A subscriber can selectively be notified based on the context.
 */
export type SubscriptionFilter<T, TContext = undefined> = (data: T, context?: TContext) => boolean

export class Writable<T = any, TContext = unknown> implements Readable<T> {
  /**
   * Subscribe functions paired with a value to be passed to them.
   * Populated by {@link Writable.set} to update subscribers.
   */
  public static readonly subscriberQueue: [Subscriber<any, any>, unknown, unknown?][] = []

  stop?: Noop

  subscribers = new Set<SubscribeInvalidateTuple<T, TContext>>()

  value: T

  start: StartStopNotifier<T>

  context?: TContext

  constructor(value?: T, start: StartStopNotifier<T> = noop, context?: TContext) {
    this.value = value as T
    this.start = start
    this.context = context
  }

  public get hasSubscribers(): boolean {
    return this.subscribers.size > 0
  }

  public update(updater: Updater<T>, context?: TContext) {
    this.set(updater(this.value as T), context)
  }

  public subscribe(run: Subscriber<T, TContext>, invalidate = noop, runFirst = true) {
    const subscriber: SubscribeInvalidateTuple<T, TContext> = [run, invalidate]

    this.subscribers.add(subscriber)

    if (this.subscribers.size === 1) {
      this.stop = this.start(this.set.bind(this), this.update.bind(this)) ?? noop
    }

    if (runFirst) {
      run(this.value as T)
    }

    return () => {
      this.subscribers.delete(subscriber)

      if (this.subscribers.size === 0 && this.stop != null) {
        this.stop()
        this.stop = undefined
      }
    }
  }

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
      if (context === undefined) {
        subscribe(value)
      } else {
        subscribe(value, context)
      }
    }

    Writable.subscriberQueue.length = 0
  }
}

/**
 * Subscribers/invalidators come in pairs.
 */
export type SubscribeInvalidateTuple<T, TContext = undefined> = [
  Subscriber<T, TContext>,
  Invalidator<T>,
  TContext?,
]
