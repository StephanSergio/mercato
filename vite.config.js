import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` must match the GitHub Pages project path:
// https://stephansergio.github.io/mercato/
export default defineConfig({
  base: '/mercato/',
  plugins: [react()],
})
