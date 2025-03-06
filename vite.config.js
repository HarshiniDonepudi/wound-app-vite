import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      '__APP_ENV__': JSON.stringify(env.APP_ENV || mode),
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    base: "/", // Ensure proper routing support on Vercel
  }
})
