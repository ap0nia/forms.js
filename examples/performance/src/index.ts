type MaximumDepthJson = {
  a: string
  b: {
    c: number
    d: {
      e: boolean
      f: {
        g: string
        h: {
          i: number
          j: {
            k: boolean
            l: {
              m: string
              n: {
                o: number
                p: {
                  q: boolean
                  r: {
                    s: string
                    t: {
                      u: number
                      v: {
                        w: boolean
                        x: {
                          y: string
                          z: {
                            aa: number
                            ab: {
                              ac: boolean

                              // react-hook-form breaks beyond this point!
                              ad: {
                                ae: string
                                af: {
                                  ag: number
                                  ah: {
                                    ai: boolean
                                    aj: {
                                      ak: string
                                      al: {
                                        am: number
                                        an: {
                                          ao: boolean
                                          ap: {
                                            aq: string
                                          }[]
                                        }
                                      }[]
                                    }
                                  }[]
                                }
                              }[]
                            }
                          }[]
                        }
                      }[]
                    }
                  }[]
                }
              }[]
            }
          }[]
        }
      }[]
    }
  }[]
}

type MyForm = {
  a: MaximumDepthJson
  // b: MaximumDepthJson
  // c: MaximumDepthJson
  // d: MaximumDepthJson
  // e: MaximumDepthJson
  // f: MaximumDepthJson
  // g: MaximumDepthJson
  // h: MaximumDepthJson
  // i: MaximumDepthJson
  // j: MaximumDepthJson
  // k: MaximumDepthJson
  // l: MaximumDepthJson
  // m: MaximumDepthJson
  // n: MaximumDepthJson
  // o: MaximumDepthJson
  // p: MaximumDepthJson
  // q: MaximumDepthJson
  // r: MaximumDepthJson
  // s: MaximumDepthJson
  // t: MaximumDepthJson
  // u: MaximumDepthJson
  // v: MaximumDepthJson
  // w: MaximumDepthJson
  // x: MaximumDepthJson
  // y: MaximumDepthJson
  // z: MaximumDepthJson
}

// Best Form!
import { FormControl } from '@forms.js/core'

export const form = new FormControl<MyForm>()

form.getValues('a.b.1.d.f.2.h.j.3.l.n.4.p.r.5.t.v.6.x.z.7')
form.registerField('a.b.1.d.f.2.h.j.3.l.n.4.p.r.5.t.v.6.x.z.7')

// Hook Form

// import { useForm } from 'react-hook-form'
//
// export const hookForm = useForm<MyForm>()
//
// hookForm.register('a.b.1.d.f.2.h.j.3.l.n.4.p.r.5.t.v.6.x.z.7')
//
//
// // Modular Form
//
// import { Field, useFormStore } from '@modular-forms/react'
//
// export const modularForm = useFormStore<MyForm>()
//
// Field({
//   of: modularForm,
//   name: 'a.b.1.d.f.2.h.j.3.l.n.4.p.r.5.t.v.6.x.z.7.ab.ad.8.af.ah.9.aj.al.10.an.ap.11',
//   children: undefined as any,
// })
//
//
// Tanstack Form

// import { FormApi } from '@tanstack/form-core'
//
// const tanstackForm = new FormApi<MyForm>()
//
// tanstackForm.fieldInfo['a.b.d.f']
