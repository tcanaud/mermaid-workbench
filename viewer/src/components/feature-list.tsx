import type { Feature } from '../lib/types';

interface Props {
  features: Feature[];
  selected: string | null;
  onSelect: (name: string) => void;
}

export function FeatureList({ features, selected, onSelect }: Props) {
  if (features.length === 0) {
    return (
      <div class="empty-state">
        <h3>No features found</h3>
        <p>Generate diagrams with the Mermaid Workbench to get started.</p>
      </div>
    );
  }

  return (
    <div>
      {features.map((f) => (
        <div
          key={f.name}
          class={`feature-item ${f.name === selected ? 'active' : ''}`}
          onClick={() => onSelect(f.name)}
        >
          <div>{f.name}</div>
          <span class="count">{f.diagramCount} diagram{f.diagramCount !== 1 ? 's' : ''}</span>
        </div>
      ))}
    </div>
  );
}
