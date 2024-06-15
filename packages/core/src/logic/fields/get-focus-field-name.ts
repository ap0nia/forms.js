export type ShouldFocusOptions = {
  /**
   * Whether to toggle focus on and off.
   */
  shouldFocus?: boolean

  /**
   * Set focus by either field index.
   */
  focusIndex?: number

  /**
   * Set focus by field name.
   */
  focusName?: string
}

export function getFocusFieldName(
  name: PropertyKey,
  index: number,
  options: ShouldFocusOptions = {},
): string {
  return options.shouldFocus || options.shouldFocus == null
    ? options.focusName ||
        `${name.toString()}.${options.focusIndex == null ? index : options.focusIndex}.`
    : ''
}

export default getFocusFieldName
