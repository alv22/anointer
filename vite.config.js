import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        bookmarklet: resolve(__dirname, 'src/bookmarklet.js'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'bookmarklet'
            ? 'bookmarklet.js'
            : 'assets/[name]-[hash].js'
        }
      }
    }
  }
})
