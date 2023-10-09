import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/form-control.ts'],
  dts: true,
  outDir: 'dist',
})
