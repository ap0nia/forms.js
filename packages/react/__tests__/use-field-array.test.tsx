import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'

import React, { useState } from 'react'

import { useForm } from '../src/use-form'
import { useFieldArray } from '../src/use-field-array'
import { FormProvider } from '../src/form-provider'
import type { Control } from '../src/control'
import type { UseFormRegister } from '../src/types'

let i = 0

function generateId() {
  return String(i++)
}

beforeEach(() => {
  i = 0
})

describe('useFieldArray', () => {
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
          control,
          name: 'test',
          generateId,
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
                {...control.register(`test.${index}.nestedArray.${i}.value` as const)}
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

    it('should not return schema error without user action', () => {
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
            test: [],
          },
        })
        const { fields } = useFieldArray({
          name: 'test',
          control,
        })

        return (
          <form>
            {errors.test && <p>minLength</p>}

            {fields.map((item, i) => (
              <fieldset key={item.id}>
                <input {...register(`test.${i}.value` as const)} />
              </fieldset>
            ))}
          </form>
        )
      }

      render(<App />)

      expect(screen.queryByText('minLength')).not.toBeInTheDocument()
    })

    it('should update error when user action corrects it', async () => {
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
            if (data.test.length > 1) {
              return {
                values: data,
                errors: {},
              }
            } else {
              return {
                values: data,
                errors: {
                  test: {
                    type: 'test',
                    message: 'minLength',
                  },
                },
              }
            }
          },
          defaultValues: {
            test: [],
          },
        })
        const { fields, append } = useFieldArray({
          name: 'test',
          control,
        })

        return (
          <form>
            {errors.test && <p>minLength</p>}
            {fields.map((item, i) => (
              <input key={item.id} {...register(`test.${i}.value` as const)} />
            ))}
            <button
              type={'button'}
              onClick={() =>
                append({
                  value: '',
                })
              }
            >
              append
            </button>
          </form>
        )
      }

      render(<App />)

      fireEvent.click(screen.getByRole('button'))

      await waitFor(() => expect(screen.queryByText('minLength')).toBeInTheDocument())

      fireEvent.click(screen.getByRole('button'))

      await waitFor(() => expect(screen.queryByText('minLength')).not.toBeInTheDocument())
    })

    it('should update error when array is changed', async () => {
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
            const errors: { test?: any } = {}
            if (data.test.length > 4) {
              errors.test = { type: 'toobig', message: 'WAY too many items' }
            } else if (data.test.length > 3) {
              errors.test = { type: 'toobig', message: 'Too many items' }
            }
            for (const [index, item] of data.test.entries()) {
              if (item.value === '') {
                errors.test = errors.test || []
                errors.test[index] = {
                  value: { type: 'required', message: 'Required' },
                }
              }
            }

            return {
              values: data,
              errors,
            }
          },
          defaultValues: {
            test: [{ value: '0' }, { value: '1' }, { value: '2' }],
          },
        })
        const { fields, append, remove } = useFieldArray({
          name: 'test',
          control,
        })

        return (
          <form>
            {errors.test?.type && <p>Array error: {errors.test.message}</p>}
            {fields.map((item, i) => (
              <div key={item.id}>
                <input {...register(`test.${i}.value` as const)} />
                <button type="button" onClick={() => remove(i)}>
                  remove
                </button>
                {errors.test?.[i]?.value && (
                  <span>
                    Item {i} error: {errors.test?.[i]?.value?.message}
                  </span>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                append({
                  value: fields.length.toString(),
                })
              }
            >
              append
            </button>
          </form>
        )
      }

      render(<App />)

      await waitFor(() => expect(screen.queryByText('Array error:')).not.toBeInTheDocument())

      fireEvent.click(screen.getByRole('button', { name: 'append' }))

      await waitFor(() =>
        expect(screen.queryByText('Array error: Too many items')).toBeInTheDocument(),
      )

      fireEvent.click(screen.getByRole('button', { name: 'append' }))

      await waitFor(() =>
        expect(screen.queryByText('Array error: WAY too many items')).toBeInTheDocument(),
      )

      fireEvent.click(screen.getAllByRole('button', { name: 'remove' })[0])

      await waitFor(() =>
        expect(screen.queryByText('Array error: Too many items')).toBeInTheDocument(),
      )

      fireEvent.click(screen.getAllByRole('button', { name: 'remove' })[0])

      await waitFor(() => expect(screen.queryByText('Array error:')).not.toBeInTheDocument())

      fireEvent.change(screen.getAllByRole('textbox')[0], {
        target: { value: '' },
      })

      await waitFor(() => expect(screen.queryByText('Item 0 error: Required')).toBeInTheDocument())

      fireEvent.click(screen.getByRole('button', { name: 'append' }))

      await waitFor(() => {
        expect(screen.queryByText('Array error: Too many items')).toBeInTheDocument()
        expect(screen.queryByText('Item 0 error: Required')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: 'append' }))

      await waitFor(() => {
        expect(screen.queryByText('Array error: WAY too many items')).toBeInTheDocument()
        expect(screen.queryByText('Item 0 error: Required')).toBeInTheDocument()
      })

      fireEvent.click(screen.getAllByRole('button', { name: 'remove' })[4])

      await waitFor(() => {
        expect(screen.queryByText('Array error: Too many items')).toBeInTheDocument()
        expect(screen.queryByText('Item 0 error: Required')).toBeInTheDocument()
      })

      fireEvent.click(screen.getAllByRole('button', { name: 'remove' })[3])

      await waitFor(() => {
        expect(screen.queryByText('Array error: Too many items')).not.toBeInTheDocument()
        expect(screen.queryByText('Item 0 error: Required')).toBeInTheDocument()
      })
    })
  })

  describe('when component unMount', () => {
    it('should keep field array values', async () => {
      let getValues: any
      const Component = () => {
        const [show, setShow] = React.useState(true)
        const { register, control, getValues: tempGetValues } = useForm()
        const { fields, append } = useFieldArray({ name: 'test', control })
        getValues = tempGetValues

        return (
          <>
            {show && (
              <div>
                {fields.map((_, i) => (
                  <input key={i.toString()} {...register(`test.${i}.value`)} />
                ))}
                <button onClick={() => append({ value: '' })}>append</button>
              </div>
            )}
            <button type={'button'} onClick={() => setShow(!show)}>
              setShow
            </button>
          </>
        )
      }

      render(<Component />)

      const button = screen.getByRole('button', { name: /append/i })

      fireEvent.click(button)

      fireEvent.click(button)

      fireEvent.click(button)

      fireEvent.click(screen.getByRole('button', { name: 'setShow' }))

      expect(getValues()).toEqual({
        test: [{ value: '' }, { value: '' }, { value: '' }],
      })

      fireEvent.click(screen.getByRole('button', { name: 'setShow' }))
      expect(screen.getAllByRole('textbox').length).toEqual(3)
    })

    it.only('should remove reset method when field array is removed', () => {
      let controlTemp: any
      let fieldsTemp: unknown[] = []

      const App = () => {
        const { register, control } = useForm({
          defaultValues: {
            test: [{ value: 'default' }],
          },
        })
        const { fields, append } = useFieldArray({
          name: 'test',
          control,
          generateId,
        })
        controlTemp = control
        fieldsTemp = fields

        return (
          <form>
            {fields.map((field) => {
              return <input key={field.id} {...register('test.0.value')} />
            })}
            <button
              type={'button'}
              onClick={() => {
                append({
                  value: 'test',
                })
              }}
            >
              append
            </button>
          </form>
        )
      }

      const { unmount } = render(<App />)

      expect(fieldsTemp).toEqual([{ id: '0', value: 'default' }])

      fireEvent.click(screen.getByRole('button'))

      expect(fieldsTemp).toEqual([
        { id: '0', value: 'default' },
        {
          id: '1',
          value: 'test',
        },
      ])

      unmount()

      expect(controlTemp._names.array).toEqual(new Set(['test']))
      expect(fieldsTemp).toEqual([
        { id: '0', value: 'default' },
        {
          id: '1',
          value: 'test',
        },
      ])
    })

    it('should unset field array values correctly on DOM removing', async () => {
      interface NestedComponentProps
        extends Pick<UseFormReturn<FormValues>, 'control' | 'register'> {
        childIndex: number
      }

      type FormValues = {
        test: {
          title: string
          nested: {
            name: string
          }[]
        }[]
        title: string
      }

      const NestedComponent = ({ childIndex, control, register }: NestedComponentProps) => {
        const { fields } = useFieldArray({
          control,
          name: `test.${childIndex}.nested` as `test.0.nested`,
        })

        return (
          <div>
            {fields.map((field, index) => {
              return (
                <div key={field.id}>
                  <input {...register(`test.${childIndex}.nested.${index}.name` as const)} />
                </div>
              )
            })}
          </div>
        )
      }

      const Component = () => {
        const { control, register } = useForm<FormValues>()
        const { fields, append, remove } = useFieldArray({
          control,
          name: 'test',
        })

        return (
          <form>
            <input {...register('title')} />
            {fields.map((field, index) => {
              return (
                <div key={field.id}>
                  <input {...register(`test.${index}.title` as const)} />
                  <button type="button" onClick={() => remove(index)}>
                    Remove child
                  </button>
                  <NestedComponent childIndex={index} control={control} register={register} />
                </div>
              )
            })}
            <button type="button" onClick={() => append({ title: 'test', nested: [] })}>
              Add child
            </button>
          </form>
        )
      }

      render(<Component />)

      const addChild = () => fireEvent.click(screen.getByText('Add child'))

      addChild()

      expect(screen.getByText('Remove child')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Remove child'))

      expect(screen.queryByText('Remove child')).not.toBeInTheDocument()

      addChild()

      expect(screen.getByText('Remove child')).toBeInTheDocument()
    })
  })
})
