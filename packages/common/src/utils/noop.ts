export function noop() {
  // noop
}

export async function asyncNoop() {
  // noop
}

export type Noop = typeof noop

export type AsyncNoop = typeof asyncNoop
