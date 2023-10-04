import type { FlattenObject } from '@forms.js/core/utils/types/flatten-object'
import { useForm } from '@tanstack/react-form'
import type { FieldApi } from '@tanstack/react-form'
import { createRoot } from 'react-dom/client'

function FieldInfo({ field }: { field: FieldApi<any, any> }) {
  return (
    <>
      {field.state.meta.touchedErrors ? <em>{field.state.meta.touchedErrors}</em> : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  )
}

export default function App() {
  const form = useForm({
    // Memoize your default values to prevent re-renders
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    onSubmit: async (values) => {
      // Do something with form data
      console.log(values)
    },
  })

  return (
    <div>
      <h1>Simple Form Example</h1>
      {/* A pre-bound form component */}
      <form.Provider>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <div>
            {/* A type-safe and pre-bound field component*/}
            <form.Field
              name="firstName"
              onChange={(value) =>
                !value
                  ? 'A first name is required'
                  : value.length < 3
                  ? 'First name must be at least 3 characters'
                  : undefined
              }
              onChangeAsyncDebounceMs={500}
              onChangeAsync={async (value) => {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                return value.includes('error') && 'No "error" allowed in first name'
              }}
              children={(field) => {
                // Avoid hasty abstractions. Render props are great!
                return (
                  <>
                    <label htmlFor={field.name}>First Name:</label>
                    <input
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>
          <div>
            <form.Field
              name="lastName"
              children={(field) => (
                <>
                  <label htmlFor={field.name}>Last Name:</label>
                  <input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button type="submit" disabled={!canSubmit}>
                {isSubmitting ? '...' : 'Submit'}
              </button>
            )}
          />
        </form>
      </form.Provider>
    </div>
  )
}

const rootElement = document.getElementById('root')!

createRoot(rootElement).render(<App />)

// type Narrowable = string | number | bigint | boolean;
// type NarrowRaw<A> = (A extends [] ? [] : never) | (A extends Narrowable ? A : never) | {
//     [K in keyof A]: A[K] extends Function ? A[K] : NarrowRaw<A[K]>;
// };
type ComputeRange<N extends number, Result extends Array<unknown> = []> = Result['length'] extends N
  ? Result
  : ComputeRange<N, [...Result, Result['length']]>
type Index40 = ComputeRange<40>[number]
type IsTuple<T> = T extends readonly any[] & {
  length: infer Length
}
  ? Length extends Index40
    ? T
    : never
  : never
type AllowedIndexes<
  Tuple extends ReadonlyArray<any>,
  Keys extends number = never,
> = Tuple extends readonly []
  ? Keys
  : Tuple extends readonly [infer _, ...infer Tail]
  ? AllowedIndexes<Tail, Keys | Tail['length']>
  : Keys

type DeepKeys<T, TDepth extends any[] = []> = TDepth['length'] extends 5
  ? never
  : unknown extends T
  ? string
  : object extends T
  ? string
  : T extends readonly any[] & IsTuple<T>
  ? AllowedIndexes<T> | DeepKeysPrefix<T, AllowedIndexes<T>, TDepth>
  : T extends any[]
  ? DeepKeys<T[number], [...TDepth, any]>
  : T extends Date
  ? never
  : T extends object
  ? (keyof T & string) | DeepKeysPrefix<T, keyof T, TDepth>
  : never

type DeepKeysPrefix<T, TPrefix, TDepth extends any[]> = TPrefix extends keyof T & (number | string)
  ? `${TPrefix}.${DeepKeys<T[TPrefix], [...TDepth, any]> & string}`
  : never

export type MyForm = {
  a: {
    aString: string
    b: {
      c: {
        d: {
          e: {
            f: {
              g: { h: string }[]
            }
          }
        }
      }
    }
  }
}

export type InferiorDeepKeys = DeepKeys<MyForm>

export type SuperiorFlatObject = FlattenObject<MyForm>

export const n: InferiorDeepKeys = 'a.b.c.d.e.f'

export const k: keyof SuperiorFlatObject = 'a.b.c.d.e.f.g.0.h'
