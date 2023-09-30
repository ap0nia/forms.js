import type { Field } from '../../types/fields'
import { getEventValue } from '../html/get-event-value'

import { getFieldValue } from './get-field-value'

export function getCurrentFieldValue(event: Event, field: Field): any {
  return event.target && 'type' in event.target  && event.target.type
    ? getFieldValue(field._f)
    : getEventValue(event)
}
