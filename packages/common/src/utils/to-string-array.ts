export function toStringArray(value: unknown): string[] | undefined {
  if (value == null) {
    return undefined
  }

  return Array.isArray(value) ? value.map(String) : [String(value)]
}
