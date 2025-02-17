import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': '/src'
    }
  },

  server: {
    port: 8082,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },

  define: {
    'process.env': {} // Ensures compatibility with environment variables
  },

  optimizeDeps: {
    exclude: [
      'gcp-metadata',
      'google-logging-utils',
      'firebase-admin'
    ] // ✅ Ensures Vite does not pre-bundle backend modules
  },

  ssr: {
    external: [
      'gcp-metadata',
      'google-logging-utils',
      'firebase-admin'
    ] // ✅ Ensures backend modules are not used in frontend
  },

  build: {
    rollupOptions: {
        external: [
            'firebase-admin', 
            'server/utils/firebaseAdmin.js'
        ] 
      },
    sourcemap: false // ✅ Prevents missing source map errors
  }
});
