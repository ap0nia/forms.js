/**
 * A literal union provides autocomplete on T, but allows anything that satisfies U.
 *
 * @example
 *
 * ```ts
 * type Pet = 'dog' | 'cat' | 'bird'
 * type Animal = LiteralUnion<Pet, string>
 *
 * let myAnimal: Animal = 'dog'
 *
 * myAnimal = 'cat' // OK, because it's of type Pet
 * myAnimal = 'dolphin' // OK, because it's of type string
 * myAnimal = 'monke' // OK, because it's of type string
 * ```
 */
export type LiteralUnion<T, U> = T | (U & { _?: never })
