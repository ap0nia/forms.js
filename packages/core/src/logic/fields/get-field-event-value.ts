import type { Field } from '../../types/fields'
import { getEventValue } from '../html/get-event-value'

import { getFieldValue } from './get-field-value'

/**
 * Gets the value of a field when given an event.
 *
 * Fallsback to the value of the actual field if the event is irrelevant.
 */
export function getFieldEventValue(event: Event, field: Field): any {
  return event.target && 'type' in event.target && event.target.type
    ? getFieldValue(field._f)
    : getEventValue(event)
}
