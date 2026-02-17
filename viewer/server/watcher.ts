import type { ViteDevServer } from 'vite';
import path from 'node:path';

const DEBOUNCE_MS = 150;

export function setupWatcher(server: ViteDevServer, outputDir: string) {
  let debounceTimer: ReturnType<typeof setTimeout>;
  const pending = new Map<string, string>();

  // Add output directory to Vite's chokidar watcher
  server.watcher.add(outputDir);

  server.watcher.on('all', (event: string, filePath: string) => {
    // Only watch .mmd and .yaml files
    if (!filePath.endsWith('.mmd') && !filePath.endsWith('.yaml')) return;

    // Only watch files within the output directory
    if (!filePath.startsWith(outputDir)) return;

    const relativePath = path.relative(outputDir, filePath);
    pending.set(relativePath, event);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      server.hot.send('mermaid:file-change', {
        changes: Object.fromEntries(pending),
      });
      pending.clear();
    }, DEBOUNCE_MS);
  });
}
