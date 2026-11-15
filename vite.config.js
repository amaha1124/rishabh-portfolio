import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'oxc',
    cssMinify: 'lightningcss',
    assetsDir: 'assets',
    assetsInlineLimit: 4096
  }
});
