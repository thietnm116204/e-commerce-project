import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://e-commerce-project-0hsd.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
