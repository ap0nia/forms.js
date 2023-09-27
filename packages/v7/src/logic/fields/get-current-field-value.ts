import type { AnyEvent } from '../../types/event'
import type { Field } from '../../types/fields'
import { getEventValue } from '../html/get-event-value'

import { getFieldValue } from './get-field-value'

export function getCurrentFieldValue(event: AnyEvent, field: Field): any {
  return event.target.type ? getFieldValue(field._f) : getEventValue(event)
}
