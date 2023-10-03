import { useCallback, useState } from 'react'

import { useForm } from './use-form'

export function App() {
  const { formControl, formState, register } = useForm()

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
