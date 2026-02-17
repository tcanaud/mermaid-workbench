import type { DiagramFrontmatter } from '../lib/types';

interface Props {
  frontmatter: DiagramFrontmatter | null;
  onNavigate: (file: string) => void;
}

export function MetadataPanel({ frontmatter, onNavigate }: Props) {
  if (!frontmatter) {
    return (
      <div class="empty-state">
        <p>Select a diagram to see its metadata.</p>
      </div>
    );
  }

  return (
    <div>
      <div class="metadata-section">
        <h4>Title</h4>
        <div class="metadata-value">{frontmatter.title}</div>
      </div>

      <div class="metadata-section">
        <h4>Type</h4>
        <div class="metadata-value">{frontmatter.type}</div>
      </div>

      <div class="metadata-section">
        <h4>Layer</h4>
        <div class="metadata-value">{frontmatter.layer}</div>
      </div>

      <div class="metadata-section">
        <h4>Feature</h4>
        <div class="metadata-value">{frontmatter.feature}</div>
      </div>

      {frontmatter.parent && (
        <div class="metadata-section">
          <h4>Parent</h4>
          <div class="metadata-value">
            <a class="metadata-link" onClick={() => {
              // parent format: "diagram-id#node-id" — extract diagram-id to find file
              const parentId = frontmatter.parent!.split('#')[0];
              // Convention: find file by matching id prefix pattern
              onNavigate(parentId);
            }}>
              {frontmatter.parent}
            </a>
          </div>
        </div>
      )}

      {frontmatter.children?.length > 0 && (
        <div class="metadata-section">
          <h4>Children</h4>
          <ul class="metadata-list">
            {frontmatter.children.map((childId) => (
              <li key={childId}>
                <a class="metadata-link" onClick={() => onNavigate(childId)}>
                  {childId}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
