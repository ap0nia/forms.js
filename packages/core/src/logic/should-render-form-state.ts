import { VALIDATION_MODE } from '../constants'
import { isEmptyObject } from '../guards/is-empty-object'

/**
 * TODO: proper form state type and proxy form state type.
 *
 * FIXEDME: Don't invoke `updateFormState` here.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function shouldRenderFormState(formState: any, proxyFormState: any, isRoot: boolean) {
  return (
    isEmptyObject(formState) ||
    Object.keys(formState).length !== Object.keys(proxyFormState).length ||
    Object.keys(formState).find((key) => proxyFormState[key] === (!isRoot || VALIDATION_MODE.all))
  )
}
