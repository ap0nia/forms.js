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

myForm.getValues()
myForm.getValues(['e.f.g.h', 'a.b.c.d'])
