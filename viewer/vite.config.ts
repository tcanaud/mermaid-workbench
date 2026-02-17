import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { mermaidViewerPlugin } from './server/plugin';

export default defineConfig({
  plugins: [
    preact(),
    mermaidViewerPlugin({
      outputDir: process.env.MERMAID_DIR,
    }),
  ],
  server: {
    open: true,
  },
});
