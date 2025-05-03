import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  build: {
    // Optimize for production
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
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
          'vendor': [
            'react', 
            'react-dom', 
            'react-router-dom',
            'framer-motion'
          ],
          'ui': [
            '@headlessui/react',
            'lucide-react',
            'react-hot-toast'
          ],
          'charts': [
            'chart.js',
            'react-chartjs-2',
            'chartjs-plugin-datalabels'
          ]
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'framer-motion',
      '@headlessui/react',
      'lucide-react',
      'react-hot-toast'
    ],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  server: {
    port: 5173,
    open: true,
    cors: true,
    hmr: {
      overlay: true,
    }
  }
})
