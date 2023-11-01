export function toStringArray<T>(value: T): string[] | (T extends undefined ? undefined : never) {
  if (value == null) {
    return undefined as any
  }

  return Array.isArray(value) ? value.map(String) : [String(value)]
}
