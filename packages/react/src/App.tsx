import { useEffect } from 'react'

import { useForm } from './use-form'
// import { useForm } from 'react-hook-form'

export function App() {
  const {
    register,
    setError,
    formState: { errors, values },
  } = useForm<{
    test: string
  }>()

  useEffect(() => {
    // setError('test', {
    //   type: 'data',
    //   message: 'data',
    // })
  }, [setError])

  console.log('render', values)

  return (
    <div>
      <input
        {...register('test', {
          maxLength: {
            message: 'max',
            value: 3,
          },
        })}
        placeholder="test"
        type="text"
      />
      <h1 dangerouslySetInnerHTML={{ __html: '&amp;' }}></h1>
      <span role="alert">{errors.test && errors.test.message}</span>
    </div>
  )
}
