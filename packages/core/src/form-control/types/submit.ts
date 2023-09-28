import type { FieldErrors } from '../../types/errors'

export type HandleSubmit<T> = (
  onValid?: SubmitHandler<T>,
  onInvalid?: SubmitErrorHandler<T>,
) => HandlerCallback

export type HandlerCallback = (event?: Event) => Promise<void>

export type SubmitHandler<T> = (data: T, event?: Event) => unknown

export type SubmitErrorHandler<T> = (errors: FieldErrors<T>, event?: Event) => unknown
