import { waitFor } from '@testing-library/react'
import { expect } from 'vitest'

export async function expectWaitForError(fn: () => unknown) {
  await expect(async () => await waitFor(fn)).rejects.toThrowError()
}
