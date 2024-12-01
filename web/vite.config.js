import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import { ports } from 'fansjs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'src': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: ports.auth_web,
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${ports.auth}`
      },
    },
  },
})
