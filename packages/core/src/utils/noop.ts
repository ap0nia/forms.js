/**
 * A shared noop function.
 */
export function noop(): unknown {
  return
}

/**
 * A generic callback function.
 */
export type Noop = typeof noop
