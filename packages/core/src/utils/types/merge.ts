/**
 * Merges two types (i.e. objects) together.
 */
export type Merge<A, B> = {
  [K in keyof A | keyof B]?: K extends keyof A & keyof B
    ? [A[K], B[K]] extends [object, object]
      ? Merge<A[K], B[K]>
      : A[K] | B[K]
    : K extends keyof A
    ? A[K]
    : K extends keyof B
    ? B[K]
    : never
}
