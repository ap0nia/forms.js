import type { Primitive } from '../guards/is-primitive'

export type LiteralUnion<T extends U, U extends Primitive> = T | (U & { _?: never })
