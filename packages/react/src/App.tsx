import { useCallback, useState } from 'react'
import { useForm } from './use-form'

type MyForm = {
  name: string
  age: number
  email: string
}

export function Form() {
  const { getValues, register, formControl, formState } = useForm<MyForm>()

  const handleSubmit = formControl.handleSubmit((data) => {
    console.log({ data })
  })

  return (
    <div>
      <form onSubmit={(e) => handleSubmit(e.nativeEvent)}>
        <input {...register('name')} />
        <button>Submit</button>
      </form>
    </div>
  )
}

export function App() {
  const [show, setShow] = useState(true)

  const toggle = useCallback(() => {
    setShow((prev) => !prev)
  }, [])

  return (
    <div>
      <button onClick={toggle}>Toggle</button>
      {show && <Form />}
    </div>
  )
}
