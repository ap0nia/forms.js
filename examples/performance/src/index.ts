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
                                            ar: {
                                              as: number
                                              at: {
                                                au: boolean
                                                av: {
                                                  aw: string
                                                  ax: {
                                                    ay: number
                                                    az: {
                                                      ba: boolean
                                                      bb: {
                                                        bc: string
                                                        bd: {
                                                          be: number
                                                        }
                                                      }
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

// // Best Form!
import { FormControl } from '@forms.js/core'

export const form = new FormControl<MyForm>()

form.register('a.b.d.f.h.j.l.n.p.r.t.v.x.z.ab.ad.af.ah.aj.al.an.ap.ar.at.av.ax.az.bb.bd.be')

// // Hook Form
//
// import { useForm } from 'react-hook-form'
//
// export const hookForm = useForm<MyForm>()
//
// hookForm.register('a.b.d.f.h.j.l.n.p.r.t.v.x.z.ab.ad.af.ah.aj.al.an.ap.ar.at.av.ax.az.bb.bd.be')
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
//   name: 'a.b.d.f.h.j.l.n.p.r.t.v.x.z.ab.ad.af.ah.aj.al.an.ap.ar.at.av.ax.az.bb.bd.be',
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
