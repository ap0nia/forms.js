export type DeepPartial<T> = T extends Record<PropertyKey, unknown>
  ? T
  : { [K in keyof T]?: DeepPartial<T[K]> }
