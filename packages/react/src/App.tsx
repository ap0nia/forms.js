import type { ReactFormControl } from './form-control'
import { useForm } from './use-form'
import { useSubscribe } from './use-watch'

function Test({ formControl }: { formControl: ReactFormControl<any> }) {
  const state = useSubscribe({ name: 'test', formControl })

  console.log('test render', state)

  return null
}

function Test1({ formControl }: { formControl: ReactFormControl<any> }) {
  const state = useSubscribe({ name: 'test1', formControl })

  console.log('test1 render', state.values)

  return null
}

export function App() {
  const { register, formControl } = useForm()

  return (
    <div>
      <Test formControl={formControl} />
      <Test1 formControl={formControl} />

      <div>
        test
        <input {...register('test')} />
      </div>

      <div>
        test1
        <input {...register('test1')} />
      </div>
    </div>
  )
}
