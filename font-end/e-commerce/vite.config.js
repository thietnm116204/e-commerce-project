import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const local = 'http://localhost:8080'
const production = 'https://e-commerce-project-0hsd.onrender.com'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: production,
        changeOrigin: true,
      },
    },
  },
})
