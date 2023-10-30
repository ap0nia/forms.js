import { Batchable } from './batchable'
import type { DumbBatchable, StoresValues } from './dumb-batchable'
import { Writable } from './writable'

export class LinkedBatchable<
  TStores extends Record<string, Writable<any, any>>,
  TValues extends StoresValues<TStores> = StoresValues<TStores>,
> extends Batchable<TStores, TValues> {
  children: Set<DumbBatchable<TStores, TValues>> = new Set()

  constructor(stores: TStores, keys = new Set<PropertyKey>(), all = false) {
    super(stores, keys, all)
  }

  override open() {
    super.open()
    this.children.forEach((child) => child.open())
  }

  override close() {
    super.close()
    this.children.forEach((child) => child.close())
  }

  override flush(force = false) {
    super.flush(force)
    this.children.forEach((child) => child.flush(force, super.buffer))
  }
}
