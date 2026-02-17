// Feature — a directory in the mermaid output folder
export interface Feature {
  name: string;       // e.g., "000-example"
  path: string;       // relative path from output dir
  diagramCount: number;
}

// Index — parsed _index.yaml for a feature
export interface FeatureIndex {
  feature: string;
  created: string;    // ISO date
  updated: string;    // ISO date
  diagrams: {
    L0: IndexDiagramEntry[];
    L1: IndexDiagramEntry[];
    L2: IndexDiagramEntry[];
  };
}

export interface IndexDiagramEntry {
  id: string;
  file: string;
  title: string;
  type: string;
}

// Diagram frontmatter — parsed from .mmd YAML header
export interface DiagramFrontmatter {
  id: string;
  title: string;
  type: 'flowchart' | 'state' | 'architecture' | 'sequence';
  layer: 'L0' | 'L1' | 'L2';
  parent: string | null;   // <diagram-id>#<node-id> or null
  children: string[];
  feature: string;
}

// Parsed diagram — frontmatter + content + path
export interface Diagram {
  frontmatter: DiagramFrontmatter;
  mermaidContent: string;
  filePath: string;
}

// Breadcrumb entry for drill-down navigation
export interface BreadcrumbEntry {
  diagramId: string;
  title: string;
  layer: 'L0' | 'L1' | 'L2';
  file: string;
}

// WebSocket file change event
export interface FileChangeEvent {
  changes: Record<string, 'add' | 'change' | 'unlink'>;
}
