import type { Batchable, StoresValues } from './revised-batchable'
import { Writable } from './writable'

export class LinkedBatchable<
  TStores extends Record<string, Writable<any, any>>,
  TValues extends StoresValues<TStores> = StoresValues<TStores>,
> {
  parent: Batchable<TStores, TValues>

  children: Set<DumbBatchable<TStores, TValues>> = new Set()

  constructor(parent: Batchable<TStores, TValues>) {
    this.parent = parent
  }
}
