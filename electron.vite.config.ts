import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['electron'],
        output: { inlineDynamicImports: true }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [react(), tailwindcss()],
    root: 'src/renderer',
    build: {
      rollupOptions: {
        input: {
          index: 'src/renderer/index.html',
          miniWindow: 'src/renderer/miniWindow.html'
        }
      }
    }
  }
})
