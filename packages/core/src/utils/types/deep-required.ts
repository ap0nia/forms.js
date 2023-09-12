export type DeepRequired<T> = T extends Record<PropertyKey, unknown>
  ? T
  : { [K in keyof T]-?: NonNullable<DeepRequired<T[K]>> }
