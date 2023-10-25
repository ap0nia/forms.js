import { renderToString } from 'react-dom/server'

import { Controller } from '../src/controller'
import { useForm } from '../src/use-form'

describe('Controller with SSR', () => {
  // issue: https://github.com/react-hook-form/react-hook-form/issues/1398
  it('should render correctly with as with component', () => {
    const Component = () => {
      const { control } = useForm<{
        test: string
      }>()

      return (
        <Controller
          defaultValue="default"
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
        />
      )
    }

    renderToString(<Component />)
  })
})
