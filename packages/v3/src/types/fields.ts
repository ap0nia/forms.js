import type { FlattenObject } from '../type-utils/flatten-object'

import type { Noop, Nullish } from './utils'
import type { RegisterOptions } from './validator'

/**
 * FIXME: Don't need to abstract this type.
 */
export type InternalFieldName = string

/**
 * FIXME: This is better represented as `AnyRecord`, instead of being tied specifically to some form construct.
 */
export type FieldValues = Record<string, any>

/**
 * A union of all the values of a record?
 */
export type FieldValue<T extends FieldValues> = T[InternalFieldName]

/**
 * FIXME: This is better represented as "keys of a flattened object".
 */
export type FieldName<T extends FieldValues = FieldValues> = Exclude<keyof FlattenObject<T>, symbol>

/**
 * A custom element is a component that simulates an HTML element.
 */
export type CustomElement<T extends FieldValues = FieldValues> = {
  name: FieldName<T>
  type?: string
  value?: any
  disabled?: boolean
  checked?: boolean
  options?: HTMLOptionsCollection
  files?: FileList | Nullish
  focus?: Noop
}

export type NativeFieldValue = string | number | boolean | null | undefined | unknown[]

/**
 * A field element is any element that can be registered as a valid form component.
 */
export type FieldElement<T extends FieldValues = FieldValues> =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | CustomElement<T>

/**
 * A reference to a field element can be any {@link FieldElement}
 */
export type Ref = FieldElement

/**
 * I'm not sure what data is stored outside of _f
 */
export type Field = {
  _f: {
    ref: Ref
    name: InternalFieldName
    refs?: HTMLInputElement[]
    mount?: boolean
  } & RegisterOptions
}

/**
 * A record of field refs?
 */
export type FieldRefs = Partial<Record<InternalFieldName, Field>>

export type FieldPath<T> = keyof FlattenObject<T>
