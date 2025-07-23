import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    // for dicom-parser which uses CommonJS
    viteCommonjs(),
  ],
  server: {
    proxy: {
      '/search': 'http://localhost:3000',
      '/view': 'http://localhost:3000',
      '/download': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
    },
  },
  // Configuration for Cornerstone3D
  optimizeDeps: {
    exclude: ["@cornerstonejs/dicom-image-loader"],
    include: ["dicom-parser"],
  },
  worker: {
    format: "es",
  },
});
