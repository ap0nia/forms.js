import { render } from '@testing-library/react'
import { describe, test, expect } from 'vitest'

import { useController } from '../src/use-controller'
import { useForm } from '../src/use-form'

describe('useController', () => {
  test('renders input correctly', () => {
    const Component = () => {
      const { formControl } = useForm<{
        test: string
        test1: { test: string }[]
      }>()

      useController({ name: 'test', formControl, defaultValue: '' })

      return null
    }

    expect(() => render(<Component />)).not.toThrowError()
  })
})
