/**
 * Special edge cases whenever recurring into records, aside from the explicit "any" type.
 */
export type NonRecordNonPrimitives = BigInt | Date | Function | Map<any, any> | Set<any> | Symbol

export type NotRecord<T> = T extends Record<string, any>
  ? T extends NonRecordNonPrimitives
    ? T
    : never
  : T