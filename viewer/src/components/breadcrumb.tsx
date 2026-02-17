import type { BreadcrumbEntry } from '../lib/types';

interface Props {
  entries: BreadcrumbEntry[];
  featureName: string | null;
  onNavigate: (index: number) => void;
}

export function Breadcrumb({ entries, featureName, onNavigate }: Props) {
  if (entries.length === 0) return null;

  return (
    <div class="breadcrumb">
      {featureName && (
        <>
          <a onClick={() => onNavigate(-1)}>{featureName}</a>
          <span>/</span>
        </>
      )}
      {entries.map((entry, i) => {
        const isLast = i === entries.length - 1;
        return (
          <span key={entry.diagramId}>
            {isLast ? (
              <span>{entry.title}</span>
            ) : (
              <>
                <a onClick={() => onNavigate(i)}>{entry.title}</a>
                <span>/</span>
              </>
            )}
          </span>
        );
      })}
    </div>
  );
}
