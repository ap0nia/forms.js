import { useForm } from 'react-hook-form'

import { useForm as myUseForm } from './useForm'
import type { ObjectToUnion } from './utils/object-to-union'
import type { UnionToIntersection } from './utils/union-to-intersection'

type MyForm = {
  a: {
    b: {
      c: {
        d: boolean
      }
    }
  }
  e: {
    f: {
      g: {
        h: string
      }
    }
  }
}

const form = useForm<MyForm>({
  resolver: async (values, context, options) => {
    values
    context
    options.names
    return { values: {}, errors: {} }
  },
})

const f = myUseForm<MyForm>({
  resolver: async (values, context, options) => {
    values
    context
    options.names
    return { values: {}, errors: {} }
  },
})

f

form.register('e.f')

export type Test = UnionToIntersection<ObjectToUnion<MyForm>>
