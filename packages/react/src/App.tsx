import { useEffect } from 'react'

import { useForm } from './use-form'

type MyForm = {
  name: string
  age: number
  email: string
}

export function App() {
  const { register, formControl } = useForm<MyForm>()

  console.log('render')

  useEffect(() => {
    const unsubscribe = formControl.state.values.subscribe((values) => {
      console.log({ values })
    })

    return () => {
      unsubscribe()
    }
  }, [formControl])

  const handleSubmit = formControl.handleSubmit((data) => {
    console.log({ data })
  })

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input {...register('name')} />
        <button>Submit</button>
      </form>
    </div>
  )
}
