import { Writable, RecordDerived } from '@forms.js/common/store'
import { useSyncExternalStore } from 'react'

const recordWritable = {
  a: new Writable(0),
  b: new Writable(1),
  c: new Writable(2),
}

function addA() {
  recordWritable.a.update((a) => a + 1)
}

function addB() {
  recordWritable.b.update((b) => b + 1)
}

function addC() {
  recordWritable.c.update((c) => c + 1)
}

const keys = new Set<string>()

const derived = new RecordDerived(recordWritable, keys)

const subDerived = (callback: () => void) => {
  const unsubscribe = derived.subscribe(() => {
    callback()
  })

  return () => {
    unsubscribe()
  }
}
const valueDerived = () => derived.value

function useProxyDerived() {
  useSyncExternalStore(subDerived, valueDerived)
  return derived.proxy
}

export function App() {
  const derivedValue = useProxyDerived()

  console.log(derivedValue.a)

  return (
    <div>
      <div>
        <pre></pre>
      </div>
      <div>
        <button onClick={addA}>Add A</button>
        <button onClick={addB}>Add B</button>
        <button onClick={addC}>Add C</button>

        <button onClick={() => keys.add('a')}>AAA</button>
        <button onClick={() => keys.delete('a')}>aaa</button>

        <button onClick={() => keys.add('b')}>BBB</button>
        <button onClick={() => keys.delete('b')}>bbb</button>

        <button onClick={() => keys.add('c')}>CCC</button>
        <button onClick={() => keys.delete('c')}>ccc</button>
      </div>
    </div>
  )
}
