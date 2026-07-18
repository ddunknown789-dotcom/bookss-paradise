import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Port comes from the PORT env var when the harness assigns one; falls back to
// 5180 for plain local runs. Not strict, so it can pick a free port instead.
const port = process.env.PORT ? Number(process.env.PORT) : 5180

export default defineConfig({
  plugins: [react()],
  server: {
    port,
    strictPort: false,
  },
})
