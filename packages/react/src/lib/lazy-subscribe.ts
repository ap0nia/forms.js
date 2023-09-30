import { Writable } from '@forms.js/common/store'

export function lazySubscribe<TObject, TWritable>(
  object: TObject,
  key: keyof TObject,
  store: Writable<TWritable>,
  state: TWritable,
  setState: React.Dispatch<React.SetStateAction<TWritable>>,
): () => void {
  let unsubscribe: () => void

  Object.defineProperty(object, key, {
    get() {
      unsubscribe ??= store.subscribe((value) => {
        setState(value)
      })

      return state
    },
  })

  return () => {
    unsubscribe?.()
  }
}
