import path from 'node:path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: { '@shared': path.resolve('src/shared') } },
    build: {
      rollupOptions: {
        input: {
          index: path.resolve('src/main/index.ts'),
          'embedding.worker': path.resolve('src/main/embeddings/embedding.worker.ts'),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: { '@shared': path.resolve('src/shared') } },
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': path.resolve('src/renderer/src'),
        '@shared': path.resolve('src/shared'),
      },
    },
    plugins: [react()],
  },
});
