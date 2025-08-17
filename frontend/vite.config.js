// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['date-fns']
  },
  // ADD THIS PROXY CONFIGURATION and during running it locally remove the server section
  // server: {
  //   proxy: {
  //     // Proxy all /api requests to backend service
  //     '/api': {
  //       target: 'http://backend-service:5000',
  //       changeOrigin: true,
  //       secure: false
  //     }
  //   }
  // }
})