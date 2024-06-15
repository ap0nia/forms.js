import type { FlattenObject as FlattenFormValues } from '../utils/flatten-object'

/**
 * Flattens a form, representing it as a flat object.
 */
export type ParseForm<T> = FlattenFormValues<T>
