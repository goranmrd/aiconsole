import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  root: path.resolve(__dirname, '..', 'frontend'),
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, '..', 'frontend', 'src') }],
  },
});