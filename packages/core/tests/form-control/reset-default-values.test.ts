import { waitFor } from '@testing-library/dom'
import { describe, expect, test } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('resetDefaultValues', async () => {
    test('async default values changes loading state', async () => {
      let isLoading = false

      new FormControl({
        defaultValues: async () => {},
        plugins: [
          {
            onInit(formControl) {
              // To hit test coverage, this artificially sets the loading value to false,
              // but it should normally be calculated (correctly) as true for asynchronous default values.
              formControl.state.isLoading.value = isLoading

              formControl.state.isLoading.subscribe((value) => {
                isLoading = value
              })
            },
          },
        ],
      })

      // isLoading should be forced to true when resetting the default values because it's a promise.
      await waitFor(() => expect(isLoading).toBeTruthy())

      // After the promise resolves, isLoading should be false.
      await waitFor(() => expect(isLoading).toBeFalsy())
    })

    test('null default values ensures loading state is false', async () => {
      let isLoading = true

      new FormControl({
        plugins: [
          {
            onInit(formControl) {
              // To hit test coverage, this artificially sets the loading value to true,
              // but it should normally be calculated (correctly) as false for synchronous default values.
              formControl.state.isLoading.value = isLoading

              formControl.state.isLoading.subscribe((value) => {
                isLoading = value
              })
            },
          },
        ],
      })

      // The default values are not asynchronous, so isLoading should be forced to false.
      await waitFor(() => expect(isLoading).toBeFalsy())
    })
  })
})
