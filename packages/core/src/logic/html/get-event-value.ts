import type { AnyEvent } from '../../types/event'
import { isObject } from '../../utils/is-object'

import { isCheckBoxInput } from './checkbox'

export function getEventValue(event: AnyEvent): any {
  if (!isObject(event) || !event.target) {
    return event
  }

  return isCheckBoxInput(event.target) ? event.target.checked : event.target.value
}
