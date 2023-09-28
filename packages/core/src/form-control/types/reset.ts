import type { Defaults } from '../../utils/types/defaults'

import type { KeepStateOptions } from './keep-state'

export type Reset<T> = (values?: Defaults<T>, options?: ResetOptions) => void

export interface ResetOptions extends KeepStateOptions {
  /**
   * Whether to keep the form's current values.
   */
  keepValues?: boolean

  /**
   * Whether to keep the same default values.
   */
  keepDefaultValues?: boolean

  /**
   * Whether to keep the submission status.
   */
  keepIsSubmitted?: boolean

  /**
   * Whether to keep the form's current submit count.
   */
  keepSubmitCount?: boolean
}
