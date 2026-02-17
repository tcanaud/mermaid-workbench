# mermaid-workbench

BMAD module + live viewer for multi-layer Mermaid diagrams. Generate, organize, and navigate `.mmd` diagrams with drill-down support across L0/L1/L2 layers.

## Install

```bash
npx mermaid-workbench init
```

This installs the BMAD module and registers it in your project's manifests. Run from a BMAD project root (where `_bmad/` or `.bmad/` exists).

## Usage

### Launch the viewer

```bash
npx mermaid-workbench viewer
```

Opens a live-reloading web viewer for all diagrams in `.bmad_output/mermaid/`.

#### Options

```bash
npx mermaid-workbench viewer --dir /path/to/diagrams   # Custom directory
npx mermaid-workbench viewer --port 3000                # Custom port
```

### Generate diagrams (BMAD)

During a BMAD session, describe what you need:

> "Generate an architecture diagram L0 for the payment system"

The agent launches a `generate-diagram` task with parameters:
- `type`: flowchart | state | architecture | sequence
- `layer`: L0 | L1 | L2
- `feature`: xxx-feature-name
- `parent`: (required for L1/L2) `<diagram-id>#<node-id>`

### Update diagrams (BMAD)

> "Add a timeout error case to the payment-gateway flowchart"

The agent launches an `update-diagram` task preserving frontmatter and relationships.

## Diagram layers

| Layer | Level | Description |
|-------|-------|-------------|
| L0 | Macro | System-level overview |
| L1 | Process | Flows and components |
| L2 | Detail | States, validations, sub-processes |

## Output structure

```
.bmad_output/mermaid/<feature>/
  _index.yaml          # Manifest with relationship tree
  L0-*.mmd             # Macro diagrams
  L1-*.mmd             # Process diagrams
  L2-*.mmd             # Detail diagrams
```

Each `.mmd` file has YAML frontmatter (id, title, type, layer, parent, children, feature) followed by Mermaid syntax.

## License

MIT
