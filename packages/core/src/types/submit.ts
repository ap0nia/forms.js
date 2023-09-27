import type { FieldErrors } from './errors'

export type SubmitHandler<T> = (data: T, event?: Event) => unknown

export type SubmitErrorHandler<T> = (errors: FieldErrors<T>, event?: Event) => unknown
