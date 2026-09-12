import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

// Aspire injects the ApiService's resolved address as these env vars when
// CloudBoard.Vue is wired up with .WithReference(apiService) in the AppHost.
const apiServiceTarget =
  process.env['services__apiservice__https__0'] ||
  process.env['services__apiservice__http__0'];

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: apiServiceTarget
      ? {
          '/api': {
            target: apiServiceTarget,
            changeOrigin: true,
            secure: process.env['NODE_ENV'] !== 'development',
          },
        }
      : undefined,
  },
});
