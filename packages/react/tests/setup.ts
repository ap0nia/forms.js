import '@testing-library/jest-dom'

import { beforeEach, afterEach } from 'vitest'

function setup() {
  document.body.innerHTML = ''
}

beforeEach(setup)
afterEach(setup)
