// @ts-check

import { defineConfig } from 'cypress'

const config = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173/',
  },
})

export default config
