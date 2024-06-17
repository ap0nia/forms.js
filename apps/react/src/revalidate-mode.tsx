import { useForm } from '@hookform/react'
import type { ValidationMode } from '@hookform/react'
import { useParams } from 'react-router-dom'

type ReValidateMode = 'onBlur' | 'onChange' | 'onSubmit' | undefined

let renderCounter = 0

export function RevalidateMode() {
  const { mode, reValidateMode } = useParams()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    firstName: string
    lastName: string
  }>({
    mode: mode as keyof ValidationMode,
    reValidateMode: reValidateMode as keyof ReValidateMode,
  })
  const onSubmit = () => {}

  renderCounter++

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName', { required: true })} placeholder="firstName" />
      {errors.firstName && <p>firstName error</p>}
      <input {...register('lastName', { required: true, maxLength: 5 })} placeholder="lastName" />
      {errors.lastName && <p>lastName error</p>}
      <button id="submit">Submit</button>
      <div id="renderCount">{renderCounter}</div>
    </form>
  )
}
