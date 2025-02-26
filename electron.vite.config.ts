/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import path from 'node:path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import type { PluginOption } from 'vite';

const sentryConfig: PluginOption[] = process.env.SENTRY_AUTH_TOKEN
  ? [
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: 'triple',
        project: 'local-llm-desktop',
        url: 'https://sentry.wearetriple.com/',
      }),
    ]
  : [];

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), ...sentryConfig],
    resolve: { alias: { '@shared': path.resolve('src/shared') } },
  },
  preload: {
    plugins: [externalizeDepsPlugin(), ...sentryConfig],
    resolve: { alias: { '@shared': path.resolve('src/shared') } },
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': path.resolve('src/renderer/src'),
        '@shared': path.resolve('src/shared'),
      },
    },
    plugins: [react(), ...sentryConfig],
  },
});
