import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // include .js so JSX inside *.js page files is transformed.
  plugins: [react({ include: /\.(js|jsx)$/ })],
  // Vite's import-analysis pass parses .js as plain JS; tell esbuild to treat
  // .js as JSX so page components written in .js are handled.
  esbuild: { loader: 'jsx', include: /\.[jt]sx?$/, exclude: [] },
  optimizeDeps: {
    esbuildOptions: { loader: { '.js': 'jsx' } },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.{test,spec}.{js,jsx}'],
    exclude: ['node_modules/**', '.next/**'],
    coverage: {
      provider: 'v8',
      include: ['pages/**/*.js', 'lib/**/*.js'],
      exclude: ['pages/_app.js'],
    },
  },
});
