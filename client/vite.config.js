import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite dev server. In development the API lives at http://localhost:5000
// and /uploads is proxied to it. The storefront itself is served on :5173.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Allow preview/dev hosts (e.g. *.e2b.app) so the prototype can be
    // opened from any origin during development and client demos.
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
