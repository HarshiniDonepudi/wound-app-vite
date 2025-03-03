import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'https://wound-app-backend.onrender.com/api'
    )
  },
  build: {
    outDir: 'dist'
  }
})