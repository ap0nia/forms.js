export function objectHasFunction<T>(data: T): boolean {
  for (const key in data) {
    if (typeof data[key] === 'function') {
      return true
    }
  }
  return false
}
