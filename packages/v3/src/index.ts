import { useForm } from 'react-hook-form'

import { useForm as myUseForm } from './use-form'

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

const hookForm = useForm<MyForm>()

hookForm.getValues()

const myForm = myUseForm<MyForm>()

const values1 = myForm.getValues('e.f.g')
const values2 = myForm.getValues(['a', 'a.b', 'e.f', 'e.f.g.h', 'a.b.c.d'])
values1
values2
