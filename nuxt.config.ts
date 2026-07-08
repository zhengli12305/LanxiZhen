import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/eslint'],
  typescript: {
    strict: true,
  },
  runtimeConfig: {
    deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
    deepseekModel: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
  },
  routeRules: {
    '/': { redirect: '/test-generate' },
  },
  vite: {
    server: {
      fs: {
        allow: [rootDir, join(rootDir, 'node_modules')],
      },
    },
  },
})
