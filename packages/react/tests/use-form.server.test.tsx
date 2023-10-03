import { renderToString } from 'react-dom/server'
import { describe, test, expect, vi } from 'vitest'

import { useForm } from '../src/use-form'

describe('useForm with SSR', () => {
  test('should not output error', () => {
    const Component = () => {
      const { register } = useForm<{
        test: string
      }>()
      return (
        <div>
          <input {...register('test')} />
        </div>
      )
    }

    const spy = vi.spyOn(console, 'error')

    expect(renderToString(<Component />)).toEqual('<div><input name="test"/></div>')

    expect(spy).not.toHaveBeenCalled()
  })

  test('should not pass down constrained API for server side rendering', () => {
    const App = () => {
      const { register } = useForm<{
        test: string
      }>()

      return (
        <div>
          <input
            {...register('test', {
              required: true,
              min: 2,
              max: 2,
              maxLength: 2,
              minLength: 2,
            })}
          />
        </div>
      )
    }

    expect(renderToString(<App />)).toEqual('<div><input name="test"/></div>')
  })

  test('should pass down constrained API for server side rendering', () => {
    const App = () => {
      const { register } = useForm<{
        test: string
      }>({
        shouldUseNativeValidation: true,
      })

      return (
        <div>
          <input
            {...register('test', {
              required: true,
              min: 2,
              max: 2,
              maxLength: 2,
              minLength: 2,
            })}
          />
        </div>
      )
    }

    expect(renderToString(<App />)).toEqual('<div><input name="test"/></div>')
  })

  test('should support progress enhancement for form', () => {
    const App = () => {
      const { register } = useForm<{
        test: string
      }>({
        progressive: true,
      })

      return (
        <div>
          <input
            {...register('test', {
              required: true,
              min: 2,
              max: 2,
              maxLength: 2,
              minLength: 2,
            })}
          />
        </div>
      )
    }

    expect(renderToString(<App />)).toEqual(
      '<div><input required="" min="2" max="2" minLength="2" maxLength="2" name="test"/></div>',
    )
  })
})
