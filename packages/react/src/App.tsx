import { FormControl, type RegisterOptions } from '@forms.js/core'
import { useMemo, useCallback, useSyncExternalStore, useState } from 'react'

function useProxyDerived() {
  const formControl = useMemo(() => {
    return new FormControl({ mode: 'all' })
  }, [])

  const register = useCallback(
    (name: string, options?: RegisterOptions) => {
      const { registerElement, unregisterElement } = formControl.register(name, options)

      const onChange = async (event: React.ChangeEvent) => {
        return await formControl.handleChange(event.nativeEvent)
      }

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

  const subDerived = useCallback((callback: () => void) => {
    return formControl.derivedState.subscribe(() => {
      callback()
    })
  }, [])

  const valueDerived = useCallback(() => {
    return formControl.derivedState.value
  }, [])

  useSyncExternalStore(subDerived, valueDerived)

  return {
    formControl,
    register,
    formState: formControl.derivedState.proxy,
  }
}

export function App() {
  const { formControl, formState, register } = useProxyDerived()

  const [show, setShow] = useState(true)

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    formControl.state.values.update((values) => {
      values[event.target.name] = event.target.value
      return values
    })
  }, [])

  const handleSubmit = formControl.handleSubmit(
    (data) => {
      console.log('data: ', data)
    },
    (errors) => {
      console.log('errors: ', errors)
    },
  )

  return (
    <div>
      <div>
        <pre>{JSON.stringify(formState.isValid, undefined, 2)}</pre>
        <pre>{JSON.stringify(formState.values, undefined, 2)}</pre>
      </div>
      <div>
        <form onSubmit={(e) => handleSubmit(e.nativeEvent)}>
          <div>
            Hello
            <input type="text" onChange={handleChange} name="hello" />
          </div>
          <div>
            World
            <input {...register('world', { required: true })} />
          </div>
          <div>
            ASDF
            {show && <input {...register('asdf', { disabled: true, required: true })} />}
          </div>
          <button>Submit</button>
        </form>
      </div>
      <button onClick={() => setShow((s) => !s)}>Toggle</button>
    </div>
  )
}

// export function App() {
//   return <div>Hi</div>
// }
