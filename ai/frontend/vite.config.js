import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: [
      '3da56e52-7331-4942-9d1f-16510b86b4e6-00-2ajqrela3k4w0.pike.replit.dev',
      '.replit.dev',
      '.repl.co'
    ]
  },
  build: {
    target: 'esnext', // Avoid eval in modern builds
    minify: false, // Disable minification to avoid eval
  },
  esbuild: {
    legalComments: 'none' // Remove legal comments that might use eval
  }
})