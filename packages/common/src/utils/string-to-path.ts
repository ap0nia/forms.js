export function stringToPath(input: string): string[] {
  const path = input.replace(/["|']|\]/g, '').split(/\.|\[/)
  return Array.isArray(path) ? path.filter(Boolean) : []
}
