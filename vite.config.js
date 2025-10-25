import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/duration-component.js',
      name: 'DurationComponent',
      fileName: 'duration-component',
      formats: ['es']
    },
    rollupOptions: {
      external: ['lit'],
      output: {
        globals: {
          lit: 'Lit'
        }
      }
    },
    // Ensure the component is properly bundled for web component usage
    target: 'esnext',
    minify: false
  },
  server: {
    port: 3000,
    open: true
  }
});
