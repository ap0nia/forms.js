import { safeGet } from '@forms.js/common/utils/safe-get'

import type { Field } from '../../types/fields'

import { isCheckBoxInput } from './checkbox'
import { elementIsLive } from './element-is-live'
import { getRefFromElement } from './get-ref-from-element'
import { isRadioInput } from './radio'

/**
 * A dummy ref that can be added to an array of refs,
 * i.e. to coerce a single checkbox into a group checkbox.
 */
export const dummyRef = {} as HTMLInputElement

/**
 * Given an element to register to a field, merge the element with the existing field.
 * @param name The name of the field.
 * @param field The field to merge with.
 * @param defaultValues The default values of the form. Exists to satisfy an edge case lol.
 *
 * @returns The merged field.
 */
export function mergeElementWithField(
  name: string,
  field: Field | undefined,
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  defaultValues?: unknown,
): Field {
  const ref = getRefFromElement(element)

  const radioOrCheckbox = isRadioInput(ref) || isCheckBoxInput(ref)

  const refs = field?._f.refs ?? []

  // The element is already registered to the field, nothing to change to the field.
  if (field && (radioOrCheckbox ? refs.find((option) => option === ref) : ref === field?._f.ref)) {
    return field
  }

  /**
   * An extra object was appended to the refs array for some reason?
   * ...(Array.isArray(safeGet(this.state.defaultValues.value, name)) ? [{}] : []),
   */
  if (!radioOrCheckbox) {
    return {
      _f: {
        ...field?._f,
        name,
        ref,
      },
    }
  }

  const newField = {
    _f: {
      name,
      ref: {
        name,
        type: ref.type,
      },
      refs: [...refs.filter(elementIsLive), ref],
    },
  } satisfies Field

  /**
   * By default, a single checkbox is assigned the value true or false.
   * However, if defaultValues assigns an array to the checkbox, then it's considered a group.
   *
   * i.e. The value of the checkbox would be an array with a single value.
   *
   * A dummy ref is added to make the refs be considered as a group.
   *
   * @see https://github.com/react-hook-form/react-hook-form/pull/7938
   */
  if (Array.isArray(safeGet(defaultValues, name))) {
    newField._f.refs.push(dummyRef)
  }

  return newField
}
