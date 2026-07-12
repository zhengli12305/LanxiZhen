import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: resolve(__dirname, '../../public'),
  server: {
    port: 5174,
    strictPort: true,
  },
})
