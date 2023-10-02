import { FormControl } from '@forms.js/core'
import { useCallback, useMemo, useSyncExternalStore } from 'react'

function useForm() {
  const formControl = useMemo(() => {
    return new FormControl()
  }, [])

  const register = useCallback(
    (name: string, options?: any) => {
      const { registerElement, unregisterElement } = formControl.register(name, options)

      const onChange = formControl.handleChange.bind(formControl)

      const props = {
        name,
        onBlur: onChange,
        onChange,
        ref: (instance: HTMLElement | null) => {
          if (instance) {
            registerElement(instance as HTMLInputElement)
          } else {
            unregisterElement()
          }
        },
      }

      return props
    },
    [formControl],
  )

  const a = useCallback((callback: () => void) => {
    return formControl.derivedState.subscribe((value) => {
      value
      callback()
    })
  }, [])

  const b = useCallback(() => {
    return formControl.derivedState.value
  }, [])

  useSyncExternalStore(a, b)

  return {
    formControl,
    formState: formControl.derivedState.proxy,
    register,
  }
}

export function App() {
  const { formControl, formState, register } = useForm()

  const handleClick = useCallback(() => {
    formControl.state.submitCount.update((count) => count + 1)
  }, [formControl])

  return (
    <div>
      <div>Hello, World</div>
      <input type="" {...register('hello')} />
      <pre>{JSON.stringify(formState.values, undefined, 3)}</pre>
      <button onClick={handleClick}>Add 1</button>
    </div>
  )
}
