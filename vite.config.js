import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Forward /api/* to the Spring Boot backend on Render.
    proxy: {
      '/api': {
        target: 'https://nest-api-m3q8.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
