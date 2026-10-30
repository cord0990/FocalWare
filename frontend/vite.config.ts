/// <reference types="vitest/config" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],
  // Solo para "npm run tunel": la app compilada se comparte con un link de Cloudflare.
  // La API y las fotos se piden a la misma dirección del link y Vite las reenvía
  // al backend local, así otro dispositivo no intenta llamar a su propio localhost.
  // "npm run dev" no usa nada de esto.
  preview: {
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
