import type { Plugin } from 'vite';
import path from 'node:path';
import { createApiRoutes } from './api';
import { setupWatcher } from './watcher';

const DEFAULT_OUTPUT_DIR = '../.bmad_output/mermaid';

export interface MermaidViewerOptions {
  outputDir?: string;
}

export function mermaidViewerPlugin(options?: MermaidViewerOptions): Plugin {
  const outputDir = path.resolve(process.cwd(), options?.outputDir ?? DEFAULT_OUTPUT_DIR);

  return {
    name: 'mermaid-viewer',

    configureServer(server) {
      // REST API middleware
      server.middlewares.use('/api', createApiRoutes(outputDir));

      // File watcher for live reload
      setupWatcher(server, outputDir);

      // Send connection event when HMR client connects
      server.hot.on('connection', () => {
        server.hot.send('mermaid:connected', { watchDir: outputDir });
      });
    },
  };
}
