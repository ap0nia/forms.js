/**
 * Converts a dot-concatenated string path to an array of path segments.
 *
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/utils/stringToPath.ts
 *
 * @example
 *
 * ```ts
 * stringToPath('foo.bar[0].baz')  // ['foo', 'bar', '0', 'baz']
 * ```
 */
export function stringToPath(input: string): string[] {
  return input
    .replace(/["|']|\]/g, '')
    .split(/\.|\[/)
    .filter(Boolean)
}
