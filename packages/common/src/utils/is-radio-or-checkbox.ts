import type { FieldElement } from '../types'

import { isCheckboxInput } from './is-checkbox-input'
import { isRadioInput } from './is-radio-input'

export function isRadioOrCheckbox(ref: FieldElement): ref is HTMLInputElement {
  return isRadioInput(ref) || isCheckboxInput(ref)
}
