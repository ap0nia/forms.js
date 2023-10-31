import { Batchable } from './batchable'
import { Bufferable, type StoresValues } from './bufferable'
import { Writable } from './writable'

export class Linkable<
  TStores extends Record<string, Writable<any, any>>,
  TValues extends StoresValues<TStores> = StoresValues<TStores>,
> extends Batchable<TStores, TValues> {
  children: Set<Bufferable<TStores, TValues>> = new Set()

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
    const buffer = [...this.buffer]
    super.flush(force)
    this.children.forEach((child) => child.flush(force, buffer))
  }

  clone(keys = new Set<PropertyKey>(), all = false) {
    const child = new Bufferable(new Writable(this.writable.value), keys, all)
    this.children.add(child)
    return child
  }
}
