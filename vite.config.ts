import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// SINGLE_FILE=1 builds one classic script (no modules, no split chunks) for the
// self-contained preview file, which has to run inside phone app previews.
const singleFile = !!process.env.SINGLE_FILE

// https://vite.dev/config/
export default defineConfig({
  // relative base so the build works from any folder or host path
  base: './',
  plugins: [react(), tailwindcss()],
  build: singleFile
    ? {
        assetsDir: 'static',
        outDir: 'dist-single',
        cssCodeSplit: false,
        modulePreload: false,
        rollupOptions: { output: { format: 'iife', inlineDynamicImports: true } },
      }
    : { assetsDir: 'static' },
})
