import type { BaseSyntheticEvent } from 'react'

import type { FieldErrors } from './errors'

export type SubmitHandler<T> = (data: T, event?: BaseSyntheticEvent) => unknown

export type SubmitErrorHandler<T> = (errors: FieldErrors<T>, event?: BaseSyntheticEvent) => unknown
