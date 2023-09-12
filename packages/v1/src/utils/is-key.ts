/**
 * Whether the value is a valid key?
 */
export function isKey(value: string) {
  return /^\w*$/.test(value)
}
