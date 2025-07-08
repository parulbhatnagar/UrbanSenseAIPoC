/**
 * @file vite.config.ts
 * This is the configuration file for Vite, the build tool used for this project.
 * Vite provides a fast development experience and bundles the application for production.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    // `plugins` is an array of Vite plugins to use. `@vitejs/plugin-react` provides
    // support for React, including Fast Refresh (Hot Module Replacement).
    plugins: [react()],
    resolve: {
      // `alias` allows us to create shortcuts for common paths in our project.
      // Here, we're setting '@' to point to the root directory ('./').
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    build: {
      // `outDir` specifies the directory where the production build files will be placed.
      // The default is 'dist'.
      outDir: 'dist',
    },
  };
});
