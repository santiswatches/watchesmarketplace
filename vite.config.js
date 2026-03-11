import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const apiTarget = mode === 'remote'
    ? 'https://watchesmarketplace.pages.dev'
    : 'http://127.0.0.1:8788';

  return {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
        }
      }
    }
  };
});