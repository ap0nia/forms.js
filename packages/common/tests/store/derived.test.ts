import { describe, test, expect } from 'vitest'

import { Writable, Derived } from '../../src/store'
import { get } from '../../src/store/utils'

describe('store', () => {
  /**
   * @see https://github.com/sveltejs/svelte/blob/master/packages/svelte/test/store/store.test.js
   */
  describe('Derived - Svelte', () => {
    test('maps a single store', () => {
      const a = new Writable(1)
      const b = new Derived(a, (n) => n * 2)

      const values: number[] = []

      const unsubscribe = b.subscribe((value) => {
        values.push(value)
      })

      a.set(2)

      expect(values).toEqual([2, 4])

      unsubscribe()

      a.set(3)

      expect(values).toEqual([2, 4])
    })

    test('maps multiple stores', () => {
      const a = new Writable(2)
      const b = new Writable(3)
      const c = new Derived([a, b], ([a, b]) => a * b)

      const values: number[] = []

      const unsubscribe = c.subscribe((value) => {
        values.push(value)
      })

      a.set(4)
      b.set(5)

      expect(values).toEqual([6, 12, 20])

      unsubscribe()

      a.set(6)

      expect(values).toEqual([6, 12, 20])
    })

    test('passes optional set function', () => {
      const number = new Writable(1)
      const evens = new Derived(
        number,
        (n, set) => {
          if (n % 2 === 0) set(n)
        },
        0,
      )

      const values: number[] = []

      const unsubscribe = evens.subscribe((value) => {
        values.push(value)
      })

      number.set(2)
      number.set(3)
      number.set(4)
      number.set(5)

      expect(values).toEqual([0, 2, 4])

      unsubscribe()

      number.set(6)
      number.set(7)
      number.set(8)

      expect(values).toEqual([0, 2, 4])
    })

    test('passes optional set and update functions', () => {
      const number = new Writable(1)
      const evens_and_squares_of4 = new Derived(
        number,
        (n, set, update) => {
          if (n % 2 === 0) set(n)
          if (n % 4 === 0) update((n) => n * n)
        },
        0,
      )

      const values: number[] = []

      const unsubscribe = evens_and_squares_of4.subscribe((value) => {
        values.push(value)
      })

      number.set(2)
      number.set(3)
      number.set(4)
      number.set(5)
      number.set(6)

      expect(values).toEqual([0, 2, 4, 16, 6])

      number.set(7)
      number.set(8)
      number.set(9)
      number.set(10)

      expect(values).toEqual([0, 2, 4, 16, 6, 8, 64, 10])

      unsubscribe()

      number.set(11)
      number.set(12)

      expect(values).toEqual([0, 2, 4, 16, 6, 8, 64, 10])
    })

    test('prevents glitches', () => {
      const lastname = new Writable('Jekyll')
      const firstname = new Derived(lastname, (n) => (n === 'Jekyll' ? 'Henry' : 'Edward'))

      const fullname = new Derived([firstname, lastname], (names) => names.join(' '))

      const values: string[] = []

      const unsubscribe = fullname.subscribe((value) => {
        values.push(value)
      })

      lastname.set('Hyde')

      expect(values).toEqual(['Henry Jekyll', 'Edward Hyde'])

      unsubscribe()
    })

    test('prevents diamond dependency problem', () => {
      const count = new Writable(0)
      const values: string[] = []

      const a = new Derived(count, ($count) => {
        return 'a' + $count
      })

      const b = new Derived(count, ($count) => {
        return 'b' + $count
      })

      const combined = new Derived([a, b], ([a, b]) => {
        return a + b
      })

      const unsubscribe = combined.subscribe((v) => {
        values.push(v)
      })

      expect(values).toEqual(['a0b0'])

      count.set(1)

      expect(values).toEqual(['a0b0', 'a1b1'])

      unsubscribe()
    })

    test('derived dependency does not update and shared ancestor updates', () => {
      const root = new Writable({ a: 0, b: 0 })
      const values: string[] = []

      const a = new Derived(root, ($root) => {
        return 'a' + $root.a
      })

      const b = new Derived([a, root], ([$a, $root]) => {
        return 'b' + $root.b + $a
      })

      const unsubscribe = b.subscribe((v) => {
        values.push(v)
      })

      expect(values).toEqual(['b0a0'])

      root.set({ a: 0, b: 1 })

      expect(values).toEqual(['b0a0', 'b1a0'])

      unsubscribe()
    })

    test('is updated with safe_not_equal logic', () => {
      const arr = [0]

      const number = new Writable(1)
      const numbers = new Derived(number, ($number) => {
        arr[0] = $number
        return arr
      })

      const concatenated: number[] = []

      const unsubscribe = numbers.subscribe((value) => {
        concatenated.push(...value)
      })

      number.set(2)
      number.set(3)

      expect(concatenated).toEqual([1, 2, 3])

      unsubscribe()
    })

    test('calls a cleanup function', () => {
      const num = new Writable(1)

      const values: number[] = []
      const cleaned_up: number[] = []

      const d = new Derived(num, ($num, set) => {
        set($num * 2)

        return function cleanup() {
          cleaned_up.push($num)
        }
      })

      num.set(2)

      const unsubscribe = d.subscribe((value) => {
        values.push(value)
      })

      num.set(3)
      num.set(4)

      expect(values).toEqual([4, 6, 8])
      expect(cleaned_up).toEqual([2, 3])

      unsubscribe()

      expect(cleaned_up).toEqual([2, 3, 4])
    })

    test('discards non-function return values', () => {
      const num = new Writable(1)

      const values: number[] = []

      const d = new Derived(num, ($num, set) => {
        set($num * 2)
        return {} as any
      })

      num.set(2)

      const unsubscribe = d.subscribe((value) => {
        values.push(value)
      })

      num.set(3)
      num.set(4)

      expect(values).toEqual([4, 6, 8])

      unsubscribe()
    })

    test('allows derived with different types', () => {
      const a = new Writable('one')
      const b = new Writable(1)
      const c = new Derived([a, b], ([a, b]) => `${a} ${b}`)

      expect(get(c)).toEqual('one 1')

      a.set('two')
      b.set(2)

      expect(get(c)).toEqual('two 2')
    })

    // it('works with RxJS-style observables', () => {
    //   const d = derived(fake_observable, (_) => _)
    //   assert.equal(get(d), 42)
    // })

    test("doesn't restart when unsubscribed from another store with a shared ancestor", () => {
      const a = new Writable(true)

      let b_started = false

      const b = new Derived(a, (_, __) => {
        b_started = true
        return () => {
          expect(b_started).toBeTruthy()
          b_started = false
        }
      })

      const c = new Derived(a, ($a, set) => {
        if ($a) {
          return b.subscribe(set)
        }
        return
      })

      c.subscribe(() => {})
      a.set(false)
      expect(b_started).toBeFalsy()
    })

    test('errors on undefined stores #1', () => {
      expect(() => {
        new Derived(null as any, (n) => n)
      }).toThrowError()
    })

    test('errors on undefined stores #2', () => {
      expect(() => {
        const a = new Writable(1)
        new Derived([a, null, undefined] as any[], ([n]: any) => {
          return n * 2
        })
      }).toThrowError()
    })
  })
})