import '@testing-library/jest-dom'

import { beforeEach, afterEach } from 'vitest'

function setup() {
  if (typeof document === 'undefined') {
    return
  }
  document.body.innerHTML = ''
}

beforeEach(setup)
afterEach(setup)
