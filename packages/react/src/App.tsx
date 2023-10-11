import { Controller } from './controller'
import { useForm } from './use-form'

export function App() {
  const { control } = useForm({
    mode: 'onChange',
  })

  return (
    <Controller
      defaultValue=""
      name="test"
      render={({ field: props, fieldState }) => (
        <>
          <input {...props} />
          {fieldState.invalid && <p>Input is invalid.</p>}
        </>
      )}
      control={control}
      rules={{
        required: true,
      }}
    />
  )
}
