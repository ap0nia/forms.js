import type { Noop } from '../utils/noop'

/**
 * An updater function receives the current value of a store, and returns the new value.
 */
export type Updater<T> = (value: T) => T

/**
 * A setter function updates the value of a store.
 */
export type Setter<T> = (value: T) => void

/**
 * Not sure what this should be named. It's the second param in {@link StartStopNotifier}.
 */
export type UpdateUpdater<T> = (updater: Updater<T>) => unknown
/**
 * Start and stop notification callbacks.
 * Called when the first subscriber subscribes;
 * can return a function that's called when when the last subscriber unsubscribes.
 */
export type StartStopNotifier<T> = (set: Setter<T>, update: UpdateUpdater<T>) => void | Noop

/**
 * A subscriber will receive the current value of a store whenever it changes.
 */
export type Subscriber<T> = (value: T, keys?: string[]) => void

/**
 * Unsubscribes from value updates.
 */
export type Unsubscriber = () => void

/**
 * Called when a value will change.
 */
export type Invalidator<T> = (value?: T) => void

/**
 * Readable interface for subscribing.
 */
export interface Readable<T> {
  /**
   * Subscribe on value changes.
   * @param run Subscription callback.
   * @param invalidate Cleanup callback.
   */
  subscribe(this: void, run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber
}
