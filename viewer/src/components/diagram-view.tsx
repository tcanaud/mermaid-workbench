import { useRef, useEffect } from 'preact/hooks';
import type { Diagram } from '../lib/types';
import { renderMermaid, type DrillDownHandler } from '../lib/mermaid-renderer';

interface Props {
  diagram: Diagram | null;
  loading: boolean;
  error: string | null;
  onDrillDown?: DrillDownHandler;
}

export function DiagramView({ diagram, loading, error, onDrillDown }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !diagram) return;
    renderMermaid(containerRef.current, diagram.mermaidContent, onDrillDown);
  }, [diagram, onDrillDown]);

  if (loading) {
    return <div class="empty-state"><p>Loading diagram...</p></div>;
  }

  if (error) {
    return <div class="diagram-error">{error}</div>;
  }

  if (!diagram) {
    return (
      <div class="empty-state">
        <h3>Select a diagram</h3>
        <p>Choose a diagram from the tree to view it here.</p>
      </div>
    );
  }

  const hasFrontmatter = diagram.frontmatter && diagram.frontmatter.title;

  return (
    <div>
      {hasFrontmatter ? (
        <h3>{diagram.frontmatter.title}</h3>
      ) : (
        <div class="diagram-warning">
          Frontmatter missing or malformed — rendering diagram without metadata.
        </div>
      )}
      <div class="diagram-container" ref={containerRef} />
    </div>
  );
}
