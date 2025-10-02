import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  base: './',
  // Prevent Vite from trying to optimize / prebundle server-only packages
  // like playwright, playwright-core and chromium-bidi which are not meant
  // to be included in the renderer bundle. Mark them as excluded and
  // external to avoid esbuild errors such as inability to resolve
  // chromium-bidi CdpConnection during client bundling.
  optimizeDeps: {
    exclude: ['playwright', 'playwright-core', 'chromium-bidi']
  },
  ssr: {
    // Ensure these packages are treated as external when doing SSR or server builds
    external: ['playwright', 'playwright-core', 'chromium-bidi']
  },
  build: {
    outDir: 'dist/react',
    emptyOutDir: true,
    rollupOptions: {
      external: ['playwright', 'playwright-core', 'chromium-bidi']
    }
  },
  server: {
    port: 3000
  }
})