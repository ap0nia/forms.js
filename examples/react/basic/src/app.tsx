import * as rhf from '@forms.js/react'
import { useMemo, useState } from 'react'

let i = 0

/**
 * @see https://github.com/react-hook-form/react-hook-form/issues/12012
 */
export function App() {
  const [c, setC] = useState(0)
  const [fieldCount, setFieldCount] = useState(1)
  const fields = useMemo(() => Array.from({ length: fieldCount }, (_, i) => i), [fieldCount])

  const form = rhf.useForm()

  return (
    <rhf.FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(() => {
          console.log('Submit!', i)
          setC(i)
        })}
      >
        <button
          type="submit"
          onClick={() => {
            i = 0
          }}
        >
          Submit!
        </button>
        <br />
        Field component was re-rendered {c} times
        <br />
        <br />
        <br />
        <button type="button" onClick={() => setFieldCount(fieldCount + 1)}>
          Add field
        </button>{' '}
        {fields.map((i) => (
          <Field key={i} name={String(i)} />
        ))}
      </form>
    </rhf.FormProvider>
  )
}

function Field(props: { name: string }) {
  i++
  const controller = rhf.useController({ name: props.name })
  console.log('IS VALIDATING: ', controller.fieldState.isValidating)
  return <p>Field {props.name}</p>
}
