import type { FieldElement } from '../../types/fields'

import { isCheckBoxInput } from './checkbox'
import { isRadioInput } from './radio'

export function isRadioOrCheckbox(ref: FieldElement): ref is HTMLInputElement {
  return isRadioInput(ref) || isCheckBoxInput(ref)
}
