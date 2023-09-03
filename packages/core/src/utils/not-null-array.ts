export function notNullArray<TValue>(value: TValue[]): NonNullable<TValue>[] {
  return (Array.isArray(value) ? value.filter(Boolean) : []) as NonNullable<TValue>[];
}
