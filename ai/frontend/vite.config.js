import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Allow external access
    allowedHosts: [
      '3da56e52-7331-4942-9d1f-16510b86b4e6-00-2ajqrela3k4w0.pike.replit.dev',
      '.replit.dev',
      '.repl.co'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})