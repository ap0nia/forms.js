import 'vitest'
import '@testing-library/jest-dom'

import { vi, beforeEach, afterEach } from 'vitest'

function setup() {
  vi.useRealTimers()
  if (typeof document === 'undefined') return
  document.body.innerHTML = ''
}

beforeEach(setup)
afterEach(setup)
