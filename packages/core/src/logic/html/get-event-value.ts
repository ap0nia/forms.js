import { isObject } from '@forms.js/common/utils/is-object'

import { isCheckBoxInput } from './checkbox'

export function getEventValue(event: unknown): any {
  if (!isObject(event) || !('target' in event) || !event.target) {
    return event
  }

  const target: any = event.target

  return isCheckBoxInput(target) ? target.checked : target.value
}
