import mermaid from 'mermaid';

let initialized = false;

function ensureInit() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'default',
  });
  initialized = true;
}

let renderCounter = 0;

// Transform click directives from URL form to callback form for drill-down
// e.g., click nodeId "./L1-auth-flow.mmd" → click nodeId onDrillDown
function transformClickDirectives(content: string): string {
  return content.replace(
    /click\s+(\w+)\s+"\.\/(.+?\.mmd)"/g,
    'click $1 onDrillDown',
  );
}

// Store mapping: nodeId → target .mmd filename (populated during transform)
let drillDownTargets: Map<string, string> = new Map();

function extractDrillDownTargets(content: string): Map<string, string> {
  const targets = new Map<string, string>();
  const regex = /click\s+(\w+)\s+"\.\/(.+?\.mmd)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    targets.set(match[1], match[2]);
  }
  return targets;
}

export type DrillDownHandler = (targetFile: string) => void;

let currentDrillDownHandler: DrillDownHandler | null = null;

// Global callback invoked by Mermaid click directives
(window as any).onDrillDown = (nodeId: string) => {
  const targetFile = drillDownTargets.get(nodeId);
  if (targetFile && currentDrillDownHandler) {
    currentDrillDownHandler(targetFile);
  } else if (!targetFile) {
    console.warn(`[mermaid-viewer] Drill-down target not found for node: ${nodeId}`);
  }
};

export async function renderMermaid(
  container: HTMLElement,
  content: string,
  onDrillDown?: DrillDownHandler,
): Promise<void> {
  ensureInit();

  const id = `mermaid-${++renderCounter}`;
  currentDrillDownHandler = onDrillDown ?? null;

  // Extract targets before transforming
  drillDownTargets = extractDrillDownTargets(content);
  const transformed = transformClickDirectives(content);

  try {
    const { svg, bindFunctions } = await mermaid.render(id, transformed);
    container.innerHTML = svg;
    bindFunctions?.(container);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    container.innerHTML = '';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'diagram-error';
    errorDiv.textContent = `Mermaid syntax error:\n${message}`;
    container.appendChild(errorDiv);
  }
}
