import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { FormProvider } from '../src/form-provider'
import { useController } from '../src/use-controller'
import { useForm } from '../src/use-form'
import { useFormContext } from '../src/use-form-context'
import { useFormState } from '../src/use-form-state'
import { useWatch } from '../src/use-watch'

describe('FormProvider', () => {
  it('should work correctly with Controller, useWatch, useFormState.', () => {
    const App = () => {
      const { field } = useController({
        name: 'test',
        defaultValue: '',
      })
      return <input {...field} />
    }

    const TestWatch = () => {
      const value = useWatch({
        name: 'test',
      })

      return <p>{value}</p>
    }

    const TestFormState = () => {
      const { isDirty } = useFormState()

      return <div>{isDirty ? 'yes' : 'no'}</div>
    }

    const TestUseFormContext = () => {
      const methods = useFormContext()
      methods.register('test')
      return null
    }

    const Component = () => {
      const methods = useForm()

      return (
        <FormProvider {...methods}>
          <App />
          <TestUseFormContext />
          <TestWatch />
          <TestFormState />
        </FormProvider>
      )
    }

    const output = renderToString(<Component />)

    expect(output).toEqual('<input name="test" value=""/><p></p><div>no</div>')
  })
})
