import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ports } from 'fansjs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: ports.auth_res_web,
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${ports.auth_res_back}`
      },
    },
  },
})
