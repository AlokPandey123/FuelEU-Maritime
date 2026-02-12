import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/routes': 'https://fueleu-maritime-ogc0.onrender.com/',
      '/compliance': 'https://fueleu-maritime-ogc0.onrender.com/',
      '/banking': 'https://fueleu-maritime-ogc0.onrender.com/',
      '/pools': 'https://fueleu-maritime-ogc0.onrender.com/',
    },
  },
})
