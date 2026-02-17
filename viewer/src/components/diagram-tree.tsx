import type { FeatureIndex } from '../lib/types';

interface Props {
  index: FeatureIndex | null;
  selectedFile: string | null;
  onSelect: (file: string) => void;
}

const LAYERS = ['L0', 'L1', 'L2'] as const;

export function DiagramTree({ index, selectedFile, onSelect }: Props) {
  if (!index) {
    return <p class="empty-state">No index available for this feature.</p>;
  }

  return (
    <div>
      {LAYERS.map((layer) => {
        const diagrams = index.diagrams[layer];
        if (!diagrams || diagrams.length === 0) return null;

        return (
          <div class="tree-group" key={layer}>
            <div class="tree-group-label">{layer}</div>
            {diagrams.map((d) => (
              <div
                key={d.file}
                class={`tree-item ${d.file === selectedFile ? 'active' : ''}`}
                onClick={() => onSelect(d.file)}
              >
                {d.title}
                <span class="type-badge">{d.type}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
