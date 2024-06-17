import { useForm } from '@hookform/react'
import { useEffect } from 'react'

let renderCounter = 0

export function SetValueCustomRegister() {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { touchedFields, isDirty, errors },
  } = useForm<{
    firstName: string
    lastName: string
  }>()

  useEffect(() => {
    register('firstName', { required: true })
    register('lastName', { required: true })
  }, [register])

  renderCounter++

  console.log(errors)

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <button
        id="TriggerDirty"
        type="button"
        onClick={() => setValue('lastName', 'test', { shouldDirty: true })}
      >
        TriggerDirty
      </button>
      <button
        id="TriggerNothing"
        type="button"
        onClick={() => setValue('firstName', '', { shouldDirty: true })}
      >
        TriggerNothing
      </button>
      <button
        id="WithError"
        type="button"
        onClick={() => setValue('firstName', '', { shouldValidate: true, shouldDirty: true })}
      >
        WithError
      </button>
      <button
        id="WithoutError"
        type="button"
        onClick={() =>
          setValue('firstName', 'true', {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
      >
        WithOutError
      </button>

      <div id="dirty">{isDirty.toString()}</div>
      <div id="touched">{Object.keys(touchedFields).map((touch) => touch)}</div>
      <div id="renderCount">{renderCounter}</div>
    </form>
  )
}
