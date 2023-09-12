import { notNullArray } from './not-null-array'

/**
 * Converts a dot concatenated path to an array of property keys.
 */
export function stringToPath(input: string): string[] {
  return notNullArray(input.replace(/["|']|\]/g, '').split(/\.|\[/))
}
