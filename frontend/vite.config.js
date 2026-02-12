import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/routes': 'http://localhost:4000',
      '/compliance': 'http://localhost:4000',
      '/banking': 'http://localhost:4000',
      '/pools': 'http://localhost:4000',
    },
  },
})
