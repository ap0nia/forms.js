export function isRegex(value: unknown): value is RegExp {
  return value instanceof RegExp
}
