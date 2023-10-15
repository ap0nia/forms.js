import { render, renderHook, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'

import type { Control } from '../src/form-control'
import { FormProvider } from '../src/form-provider'
import { useFieldArray } from '../src/use-field-array'
import { useForm } from '../src/use-form'

let i = 0

function idGenerator() {
  return String(i++)
}

describe('useFieldArray', () => {
  beforeEach(() => {
    i = 0
  })

  describe('initialize', () => {
    it('should return default fields value', () => {
      const { result } = renderHook(() => {
        const { control } = useForm()
        return useFieldArray({
          control,
          name: 'test',
        })
      })

      expect(result.current.fields).toEqual([])
    })

    it('should populate default values into fields', () => {
      const { result } = renderHook(() => {
        const { control } = useForm({
          defaultValues: { test: [{ test: '1' }, { test: '2' }] },
        })
        return useFieldArray({
          idGenerator,
          control,
          name: 'test',
        })
      })

      expect(result.current.fields).toEqual([
        { test: '1', id: '0' },
        { test: '2', id: '1' },
      ])
    })

    it('should render with FormProvider', () => {
      const Provider = ({ children }: { children: React.ReactNode }) => {
        const methods = useForm()
        return <FormProvider {...methods}>{children}</FormProvider>
      }
      const { result } = renderHook(() => useFieldArray({ name: 'test' }), {
        wrapper: Provider,
      })
      expect(result.error).toBeUndefined()
    })
  })

  describe('with should unregister false', () => {
    it('should still remain input value with toggle', () => {
      const Component = () => {
        const { register, control } = useForm<{
          test: {
            value: string
          }[]
        }>()
        const [show, setShow] = React.useState(true)
        const { fields, append } = useFieldArray({
          control,
          name: 'test',
        })

        return (
          <form>
            {show &&
              fields.map((field, i) => (
                <input key={field.id} {...register(`test.${i}.value` as const)} />
              ))}
            <button type="button" onClick={() => append({ value: '' })}>
              append
            </button>
            <button type="button" onClick={() => setShow(!show)}>
              toggle
            </button>
          </form>
        )
      }

      render(<Component />)

      fireEvent.click(screen.getByRole('button', { name: 'append' }))
      expect(screen.getAllByRole('textbox').length).toEqual(1)
      fireEvent.click(screen.getByRole('button', { name: 'toggle' }))
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'toggle' }))
      expect(screen.getAllByRole('textbox').length).toEqual(1)
    })

    it('should show errors during mount when mode is set to onChange', async () => {
      const Component = () => {
        const {
          register,
          control,
          formState: { isValid, errors },
        } = useForm<{ test: { value: string }[] }>({
          defaultValues: {
            test: [{ value: 'test' }],
          },
          resolver: async () => ({
            values: {},
            errors: {
              test: [{ value: { message: 'wrong', type: 'test' } }],
            },
          }),
          mode: 'onChange',
        })
        const { fields, append } = useFieldArray({ name: 'test', control })

        return (
          <form>
            {fields.map((field, i) => (
              <input key={field.id} {...register(`test.${i}.value` as const)} />
            ))}
            <button
              type="button"
              onClick={() =>
                append({
                  value: 'test',
                })
              }
            >
              append
            </button>

            {!isValid && <p>not valid</p>}
            {errors.test && <p>errors</p>}
          </form>
        )
      }

      render(<Component />)

      expect(await screen.findByRole('textbox')).toBeVisible()
      expect(await screen.findByText('not valid')).toBeVisible()
    })

    it('should retain input values during unmount', async () => {
      type FormValues = {
        test: { name: string }[]
      }

      const FieldArray = ({
        control,
        register,
      }: {
        control: Control<FormValues>
        register: UseFormRegister<FormValues>
      }) => {
        const { fields } = useFieldArray({
          control,
          name: 'test',
        })

        return (
          <div>
            {fields.map((item, index) => {
              return (
                <div key={item.id}>
                  <input {...register(`test.${index}.name`)} />
                </div>
              )
            })}
          </div>
        )
      }

      const App = () => {
        const [show, setShow] = React.useState(true)
        const { control, register } = useForm({
          shouldUnregister: false,
          defaultValues: {
            test: [{ name: 'test' }],
          },
        })

        return (
          <div>
            {show && <FieldArray control={control} register={register} />}
            <button type={'button'} onClick={() => setShow(!show)}>
              toggle
            </button>
          </div>
        )
      }

      render(<App />)

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: '12345' },
      })

      fireEvent.click(screen.getByRole('button'))

      fireEvent.click(screen.getByRole('button'))

      expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual('12345')
    })
  })

  describe('with resolver', () => {
    it('should provide updated form value each action', async () => {
      let formData = {}
      const Component = () => {
        const {
          register,
          control,
          formState: { isValid },
        } = useForm<{
          data: string
          test: { value: string }[]
        }>({
          resolver: (data) => {
            formData = data
            return {
              values: {},
              errors: {},
            }
          },
        })
        const { fields, append } = useFieldArray({ name: 'test', control })

        return (
          <div>
            <input {...register('data')} defaultValue="test" />
            {fields.map((field, i) => (
              <input key={field.id} {...register(`test.${i}.value` as const)} />
            ))}
            <button onClick={() => append({ value: '' })}>append</button>
            <span>{isValid && 'valid'}</span>
          </div>
        )
      }

      render(<Component />)

      expect(await screen.findByText('valid')).toBeVisible()

      fireEvent.click(screen.getByRole('button'))

      expect(formData).toEqual({
        data: 'test',
        test: [{ value: '' }],
      })
    })
  })

  it('should provide correct form data with nested field array', async () => {
    type FormValues = {
      test: {
        value: string
        nestedArray: {
          value: string
        }[]
      }[]
    }

    let formData: any = {}
    const Nested = ({ index, control }: { control: Control<FormValues>; index: number }) => {
      const { fields, append } = useFieldArray<FormValues>({
        name: `test.${index}.nestedArray` as const,
        control,
      })

      return (
        <div>
          {fields.map((item, i) => (
            <input
              key={item.id}
              {...control.registerReact(`test.${index}.nestedArray.${i}.value` as const)}
            />
          ))}

          <button type={'button'} onClick={() => append({ value: 'test' })}>
            Append Nest
          </button>
        </div>
      )
    }

    const Component = () => {
      const {
        register,
        control,
        formState: { isValid },
      } = useForm<FormValues>({
        resolver: (data) => {
          formData = data
          return {
            values: data,
            errors: {},
          }
        },
        mode: 'onChange',
        defaultValues: {
          test: [{ value: '1', nestedArray: [{ value: '2' }] }],
        },
      })
      const { fields, remove } = useFieldArray({
        name: 'test',
        control,
      })

      return (
        <form>
          {fields.map((item, i) => (
            <fieldset key={item.id}>
              <input {...register(`test.${i}.value` as const)} />

              <Nested control={control} index={i} />
              <button type={'button'} onClick={() => remove(i)}>
                delete
              </button>
            </fieldset>
          ))}
          <span>{isValid && 'valid'}</span>
        </form>
      )
    }

    render(<Component />)

    fireEvent.click(screen.getByRole('button', { name: 'Append Nest' }))

    expect(await screen.findByText('valid')).toBeVisible()

    expect(formData).toEqual({
      test: [
        {
          value: '1',
          nestedArray: [{ value: '2' }, { value: 'test' }],
        },
      ],
    })

    fireEvent.click(screen.getByRole('button', { name: 'delete' }))

    expect(formData).toEqual({
      test: [],
    })
  })

  it('should report field array error during user action', async () => {
    const App = () => {
      const {
        register,
        control,
        formState: { errors },
      } = useForm<{
        test: { value: string }[]
      }>({
        mode: 'onChange',
        resolver: (data) => {
          return {
            values: data,
            errors: {
              test: {
                type: 'test',
                message: 'minLength',
              },
            },
          }
        },
        defaultValues: {
          test: [{ value: '1' }],
        },
      })
      const { fields, remove } = useFieldArray({
        name: 'test',
        control,
      })

      return (
        <form>
          {errors.test && <p>minLength</p>}

          {fields.map((item, i) => (
            <fieldset key={item.id}>
              <input {...register(`test.${i}.value` as const)} />
              <button type={'button'} onClick={() => remove(i)}>
                delete
              </button>
            </fieldset>
          ))}
        </form>
      )
    }

    render(<App />)

    expect(screen.queryByText('minLength')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button'))

    expect(await screen.findByText('minLength')).toBeVisible()
  })
})
