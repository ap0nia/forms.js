import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { ResolverResult } from '../../src/logic/resolver'

describe('FormContol', () => {
  describe('processResolverResult', () => {
    test('no names and no errors merges an empty object', () => {
      const formControl = new FormControl()

      const resolverResult: ResolverResult<any> = { values: {} }

      formControl.processResolverResult(resolverResult)

      expect(formControl.formState.errors).toEqual({})
    })

    test('no names merges the errors', () => {
      const formControl = new FormControl()

      const resolverResult: ResolverResult<any> = {
        values: {},
        errors: {
          name: {
            type: 'required',
          },
        },
      }

      formControl.processResolverResult(resolverResult)

      expect(formControl.formState.errors).toEqual(resolverResult.errors)
    })
  })

  test('specified names only merges certain errors', async () => {
    const formControl = new FormControl()

    const resolverResult = {
      values: {},
      errors: {
        name: {
          type: 'required',
        },
        age: {
          type: 'required',
        },
      },
    } satisfies ResolverResult<any>

    formControl.processResolverResult(resolverResult, ['name'])

    expect(formControl.formState.errors).toEqual({
      name: resolverResult.errors.name,
    })
  })
})
