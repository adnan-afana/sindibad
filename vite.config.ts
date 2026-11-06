import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // relative base so the build works from any folder or host path
  base: './',
  plugins: [react(), tailwindcss()],
  build: { assetsDir: 'static' },
})
