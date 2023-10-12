import { render, renderHook, fireEvent, screen } from '@testing-library/react'
import { describe, beforeEach, it, expect, vi as jest } from 'vitest'

import type { Control } from '../src/form-control'
import { FormProvider } from '../src/form-provider'
import { useForm } from '../src/use-form'
import { useWatch } from '../src/use-watch'

let i = 0

jest.mock('../logic/generateId', () => () => String(i++))

describe('useWatch', () => {
  beforeEach(() => {
    i = 0
  })

  it('should return default value in useForm', () => {
    let method
    let watched
    const Component = () => {
      method = useForm<{ test: string }>({ defaultValues: { test: 'test' } })
      watched = useWatch({ control: method.control })
      return <div />
    }
    render(<Component />)

    expect(watched).toEqual({ test: 'test' })
  })

  it('should return default value in useWatch', () => {
    const { result } = renderHook(() => {
      const { control } = useForm<{ test: string }>({
        defaultValues: {
          test: 'test',
        },
      })
      return useWatch({
        control,
        name: 'test',
      })
    })

    expect(result.current).toEqual('test')
  })

  it('should return default value for single input', () => {
    const { result } = renderHook(() => {
      const { control } = useForm<{ test: string; test1: string }>({
        defaultValues: {
          test: 'test',
          test1: 'test1',
        },
      })
      return useWatch({
        control,
        name: 'test',
      })
    })

    expect(result.current).toEqual('test')
  })

  it('should return default values for array of inputs', () => {
    const { result } = renderHook(() => {
      const { control } = useForm<{ test: string; test1: string }>({
        defaultValues: {
          test: 'test',
          test1: 'test1',
        },
      })
      return useWatch({
        control,
        name: ['test', 'test1'],
      })
    })

    expect(result.current).toEqual(['test', 'test1'])
  })

  it('should return own default value for single input', () => {
    const { result } = renderHook(() => {
      const { control } = useForm<{ test: string; test1: string }>({})
      return useWatch({
        control,
        name: 'test',
        defaultValue: 'test',
      })
    })

    expect(result.current).toEqual('test')
  })

  it('should return own default value for array of inputs', () => {
    const { result } = renderHook(() => {
      const { control } = useForm<{ test: string; test1: string }>({})
      return useWatch({
        control,
        name: ['test', 'test1'],
        defaultValue: {
          test: 'test',
          test1: 'test1',
        },
      })
    })

    expect(result.current).toEqual(['test', 'test1'])
  })

  it('should return default value when name is undefined', () => {
    const { result } = renderHook(() => {
      const { control } = useForm<{ test: string; test1: string }>({
        defaultValues: {
          test: 'test',
          test1: 'test1',
        },
      })
      return useWatch({
        control,
      })
    })

    expect(result.current).toEqual({ test: 'test', test1: 'test1' })
  })

  it('should return empty array when watch array fields', () => {
    const { result } = renderHook(() => {
      const { control } = useForm<{ test: string }>()
      return useWatch({
        control,
        name: ['test'],
      })
    })

    expect(result.current).toEqual([undefined])
  })

  it('should return undefined', () => {
    const { result } = renderHook(() => {
      const { control } = useForm<{ test: string }>()
      return useWatch({
        control,
        name: 'test',
      })
    })

    expect(result.current).toBeUndefined()
  })

  it('should render with FormProvider', () => {
    const Provider = ({ children }: { children: React.ReactNode }) => {
      const methods = useForm<{ test: string }>()
      return <FormProvider {...methods}>{children}</FormProvider>
    }
    const { result } = renderHook(() => useWatch({ name: 'test' }), {
      wrapper: Provider,
    })
    expect(result.error).toBeUndefined()
  })

  it('should remove input with shouldUnregister: true and deeply nested', async () => {
    type FormValue = {
      test: string
    }

    let submitData = {}

    const Child = ({
      control,
      register,
    }: {
      register: UseFormRegister<FormValue>
      control: Control<FormValue>
    }) => {
      const show = useWatch({
        control,
        name: 'test',
      })

      return <>{show && show !== 'test' && <input {...register('test')} />}</>
    }

    const Component = () => {
      const { register, control, handleSubmit } = useForm<FormValue>({
        defaultValues: {
          test: 'bill',
        },
        shouldUnregister: true,
      })

      return (
        <form
          onSubmit={handleSubmit((data) => {
            submitData = data
          })}
        >
          <Child control={control} register={register} />
          <button>submit</button>
        </form>
      )
    }

    render(<Component />)

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'test' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'submit' }))

    expect(submitData).toEqual({})
  })
})
