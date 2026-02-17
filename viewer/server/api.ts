import type { Connect } from 'vite';
import path from 'node:path';
import { discoverFeatures, parseFeatureIndex, parseDiagram } from './parser';

export function createApiRoutes(outputDir: string): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = req.url ?? '';

    // GET /features (mounted at /api)
    if (url === '/features' && req.method === 'GET') {
      try {
        const features = await discoverFeatures(outputDir);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ features }));
      } catch {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Failed to discover features' }));
      }
      return;
    }

    // GET /features/:name/diagrams/:file
    const diagramMatch = url.match(/^\/features\/([^/]+)\/diagrams\/([^/]+)$/);
    if (diagramMatch && req.method === 'GET') {
      const [, name, file] = diagramMatch;
      const filePath = path.join(outputDir, name, file);
      try {
        const diagram = await parseDiagram(filePath);
        diagram.filePath = `${name}/${file}`;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(diagram));
      } catch {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Diagram not found: ${name}/${file}` }));
      }
      return;
    }

    // GET /features/:name
    const featureMatch = url.match(/^\/features\/([^/]+)$/);
    if (featureMatch && req.method === 'GET') {
      const [, name] = featureMatch;
      const featureDir = path.join(outputDir, name);
      try {
        const index = await parseFeatureIndex(featureDir);
        if (index) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(index));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: `No _index.yaml found for feature: ${name}` }));
        }
      } catch {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Feature not found: ${name}` }));
      }
      return;
    }

    next();
  };
}
