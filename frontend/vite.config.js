import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// URL backendu z .env lub domyślnie localhost
const backendUrl = process.env.VITE_API_URL || 'http://localhost:5000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': backendUrl
    }
  }
})
