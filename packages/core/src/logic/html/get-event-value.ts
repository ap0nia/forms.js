import { isObject } from '@forms.js/common/utils/is-object'

import { isCheckBoxInput } from './checkbox'

/**
 * The `event` should usually be an `Event` object. It is typed as `unknown` to allow
 * passing any object, e.g. representing an event.
 */
export function getEventValue(event: unknown): any {
  if (!isObject(event) || !('target' in event) || !event.target) {
    return event
  }

  const target: any = event.target

  return isCheckBoxInput(target) ? target.checked : target.value
}
