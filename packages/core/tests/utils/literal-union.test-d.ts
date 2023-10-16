import { describe, test, expectTypeOf } from 'vitest'

import type { LiteralUnion } from '../../src/utils/literal-union'

describe('LiteralUnion', () => {
  type Animal = 'dog' | 'cat' | 'bird'

  type AnimalOrString = LiteralUnion<Animal, string>

  type Numbers = 1 | 2 | 3

  type NumbersOrNumber = LiteralUnion<Numbers, number>

  type NumbersAndAnimals = Animal | Numbers

  type NumbersOrAnimalsOrBoolean = LiteralUnion<NumbersAndAnimals, boolean>

  describe('allows anything in `T`', () => {
    test('AnimalOrString: Animal', () => {
      expectTypeOf<'dog'>().toMatchTypeOf<AnimalOrString>()
      expectTypeOf<'cat'>().toMatchTypeOf<AnimalOrString>()
      expectTypeOf<'bird'>().toMatchTypeOf<AnimalOrString>()
    })

    test('NumbersOrNumber: Numbers', () => {
      expectTypeOf<1>().toMatchTypeOf<NumbersOrNumber>()
      expectTypeOf<2>().toMatchTypeOf<NumbersOrNumber>()
      expectTypeOf<3>().toMatchTypeOf<NumbersOrNumber>()
    })

    test('NumbersOrAnimalsOrBoolean: NumbersOrAnimals', () => {
      expectTypeOf<'dog'>().toMatchTypeOf<NumbersOrAnimalsOrBoolean>()
      expectTypeOf<'cat'>().toMatchTypeOf<NumbersOrAnimalsOrBoolean>()
      expectTypeOf<1>().toMatchTypeOf<NumbersOrAnimalsOrBoolean>()
      expectTypeOf<2>().toMatchTypeOf<NumbersOrAnimalsOrBoolean>()
    })
  })

  describe('allows anything in `U`', () => {
    test('AnimalOrString: String', () => {
      expectTypeOf<'abc'>().toMatchTypeOf<AnimalOrString>()
      expectTypeOf<'def'>().toMatchTypeOf<AnimalOrString>()
      expectTypeOf<'ghi'>().toMatchTypeOf<AnimalOrString>()
    })

    test('NumbersOrNumber: Number', () => {
      expectTypeOf<100>().toMatchTypeOf<NumbersOrNumber>()
      expectTypeOf<69>().toMatchTypeOf<NumbersOrNumber>()
      expectTypeOf<420>().toMatchTypeOf<NumbersOrNumber>()
    })

    test('NumbersOrAnimalsOrBoolean: Boolean', () => {
      expectTypeOf<true>().toMatchTypeOf<NumbersOrAnimalsOrBoolean>()
      expectTypeOf<false>().toMatchTypeOf<NumbersOrAnimalsOrBoolean>()
    })
  })
})
