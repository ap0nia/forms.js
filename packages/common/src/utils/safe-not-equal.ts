/**
 * Compares values for equality. Used by Svelte stores.
 *
 * @see https://github.com/sveltejs/svelte/blob/8de9dc61447fbad9d0984ffaa9434ce3f9655c16/packages/svelte/src/runtime/internal/utils.js#L65
 */
export function safeNotEqual(a: unknown, b: unknown): boolean {
  return a != a
    ? b == b
    : a !== b || (a != null && typeof a === 'object') || typeof a === 'function'
}
