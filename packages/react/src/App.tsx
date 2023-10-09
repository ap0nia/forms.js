import type { FormControl } from '@forms.js/core'
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'

import { useForm } from './use-form'
// import { useForm } from 'react-hook-form'

export type UseFormStateProps = {
  name: string | string[]
  control: FormControl<any>
}

export function useFormState(props: UseFormStateProps) {
  const proxy = useRef(props.control.derivedState.createTrackingProxy(props.name))

  const subscribe = useCallback(
    (callback: () => void) => {
      return props.control.derivedState.subscribe(() => {
        callback()
      })
    },
    [props.control],
  )

  const getSnapshot = useCallback(() => {
    return proxy.current
  }, [])

  useSyncExternalStore(subscribe, getSnapshot)

  return proxy.current
}

export function App() {
  const { register, setError, formControl } = useForm<{
    test: string
    t1: string
  }>()

  const formState = useFormState({ name: ['test', 't1'], control: formControl })

  useEffect(() => {
    // setError('test', {
    //   type: 'data',
    //   message: 'data',
    // })
  }, [setError])

  console.log('render', formState.values)

  return (
    <div>
      <input {...register('test', { maxLength: { message: 'max', value: 3 } })} />
      <input {...register('t1', { maxLength: { message: 'max', value: 3 } })} />
      <h1 dangerouslySetInnerHTML={{ __html: '&amp;' }}></h1>
    </div>
  )
}
