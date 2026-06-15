/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Lume - Beauty Booking',
        short_name: 'Lume',
        description: 'Premium mobile platform for booking professional makeup artists',
        theme_color: '#F2A4B0',
        background_color: '#FDF6F0',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false // Enable in development for testing
      }
    })
  ],
  // Production build configuration
  build: {
    // Output directory
    outDir: 'dist',
    // Clean dist before build
    emptyOutDir: true,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Target modern browsers for better optimization
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    // Enable minification
    minify: 'esbuild',
    // Enable gzip compression analysis
    reportCompressedSize: true,
    // Source maps for debugging in production (disable for smaller builds)
    sourcemap: false,
    // Optimize chunk size
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router-dom')) {
              return 'router';
            }
            if (id.includes('framer-motion')) {
              return 'animation';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
          }
        },
        // Optimize asset file names for caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const extType = info.at(-1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType || '')) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        // Optimize chunk file names
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    // Asset optimization
    assetsDir: 'assets',
    // Enable asset inlining for small assets
    assetsInlineLimit: 4096, // 4KB threshold
  },
  // Optimize dependencies for better bundling
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'lucide-react', 
      'framer-motion'
    ],
    // Force optimize these deps
    force: true,
  },
  // Preview configuration (for testing production builds)
  preview: {
    port: 4173,
    host: true,
    cors: true,
  },
  // Base URL configuration (can be overridden via env var)
  base: process.env.VITE_BASE_URL || '/',
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  // Environment variables prefix
  envPrefix: 'VITE_',
  // Test configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
