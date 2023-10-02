/**
 * Based on Svelte's implementation of stores.
 *
 * @see https://github.com/sveltejs/svelte/blob/master/packages/svelte/src/runtime/store/index.js
 */

import { noop, type Noop } from '../utils/noop.js'
import { safeNotEqual } from '../utils/safe-not-equal.js'

import type { Invalidator, Readable, StartStopNotifier, Subscriber, Updater } from './types'

export class Writable<T = any> implements Readable<T> {
  /**
   * Subscribe functions paired with a value to be passed to them.
   * Populated by {@link Writable.set} to update subscribers.
   */
  public static readonly subscriberQueue: [Subscriber<any>, unknown][] = []

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

  public update(updater: Updater<T>) {
    this.set(updater(this.value as T))
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

  public set(value: T): void {
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
      Writable.subscriberQueue.push([subscribe, value])
    }

    if (shouldRunQueue) {
      for (const [subscriber, subscriberValue] of Writable.subscriberQueue) {
        subscriber(subscriberValue)
      }

      Writable.subscriberQueue.length = 0
    }
  }
}

/**
 * Subscribers/invalidators come in pairs.
 */
export type SubscribeInvalidateTuple<T> = [Subscriber<T>, Invalidator<T>]
