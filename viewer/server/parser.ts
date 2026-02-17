import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { parse as parseYaml } from 'yaml';
import type { Feature, FeatureIndex, Diagram } from '../src/lib/types';

export async function discoverFeatures(outputDir: string): Promise<Feature[]> {
  const entries = await fs.readdir(outputDir, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory());

  const features: Feature[] = await Promise.all(
    dirs.map(async (dir) => {
      const dirPath = path.join(outputDir, dir.name);
      const files = await fs.readdir(dirPath);
      const diagramCount = files.filter((f) => f.endsWith('.mmd')).length;
      return {
        name: dir.name,
        path: dir.name,
        diagramCount,
      };
    }),
  );

  return features.sort((a, b) => a.name.localeCompare(b.name));
}

export async function parseFeatureIndex(featureDir: string): Promise<FeatureIndex | null> {
  const indexPath = path.join(featureDir, '_index.yaml');

  try {
    const content = await fs.readFile(indexPath, 'utf-8');
    return parseYaml(content) as FeatureIndex;
  } catch {
    // Fallback: infer diagram tree from .mmd filenames (L0/L1/L2 prefix)
    return inferIndexFromFilenames(featureDir);
  }
}

async function inferIndexFromFilenames(featureDir: string): Promise<FeatureIndex | null> {
  try {
    const files = await fs.readdir(featureDir);
    const mmdFiles = files.filter((f) => f.endsWith('.mmd')).sort();

    if (mmdFiles.length === 0) return null;

    const diagrams: FeatureIndex['diagrams'] = { L0: [], L1: [], L2: [] };

    for (const file of mmdFiles) {
      const layerMatch = file.match(/^(L[012])-/);
      const layer = layerMatch ? layerMatch[1] as 'L0' | 'L1' | 'L2' : 'L0';
      const id = file.replace('.mmd', '');
      const title = id.replace(/^L[012]-/, '').replace(/-/g, ' ');

      diagrams[layer].push({ id, file, title, type: 'flowchart' });
    }

    return {
      feature: path.basename(featureDir),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      diagrams,
    };
  } catch {
    return null;
  }
}

export async function parseDiagram(filePath: string): Promise<Diagram> {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data, content: mermaidContent } = matter(content);

  return {
    frontmatter: data as Diagram['frontmatter'],
    mermaidContent: mermaidContent.trim(),
    filePath,
  };
}
