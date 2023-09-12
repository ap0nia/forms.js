import { VALIDATION_MODE } from '../constants'

/**
 * But this isn't "getting" anything, it's creating a new object?
 */
export function getProxyFormState(
  formState: any,
  control: any,
  localProxyFormState?: any,
  isRoot = true,
) {
  const result = { defaultValues: control._defaultValues }

  for (const key in formState) {
    Object.defineProperty(result, key, {
      get: () => {
        const _key = key

        if (control._proxyFormState[_key] !== VALIDATION_MODE.all) {
          control._proxyFormState[_key] = !isRoot || VALIDATION_MODE.all
        }

        if (localProxyFormState) {
          localProxyFormState[_key] = true
        }

        return formState[_key]
      },
    })
  }

  return result
}
