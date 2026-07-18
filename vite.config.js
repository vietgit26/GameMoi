import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Đường dẫn tương đối tương thích 100% với GitHub Pages (/GameMoi/), Vercel & Netlify
  root: './',
  publicDir: 'public',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
});
