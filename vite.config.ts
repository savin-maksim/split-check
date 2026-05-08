import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import reactScan from '@react-scan/vite-plugin-react-scan'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const resolve = (dir: string) => path.resolve(__dirname, 'src', dir)

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    reactScan({
      enable: command === 'serve',
      autoDisplayNames: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve('.'),
      '@app': resolve('app'),
      '@pages': resolve('pages'),
      '@widgets': resolve('widgets'),
      '@features': resolve('features'),
      '@entities': resolve('entities'),
      '@shared': resolve('shared'),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['mathjs'],
        },
      },
    },
  },
  server: {
    host: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "@/app/styles/shared" as *;\n`,
      },
    },
  },
}))
