import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
    },
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
