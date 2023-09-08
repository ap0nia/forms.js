export function stringToPath(input: string): string[] {
  return input
    .replace(/["|']|\]/g, '')
    .split(/\.|\[/)
    .filter(Boolean)
}
