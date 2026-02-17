import { useState, useEffect, useCallback } from 'preact/hooks';
import { useFeatures } from './hooks/use-features';
import { useDiagram } from './hooks/use-diagram';
import { useWebSocket } from './hooks/use-websocket';
import { FeatureList } from './components/feature-list';
import { DiagramTree } from './components/diagram-tree';
import { DiagramView } from './components/diagram-view';
import { Breadcrumb } from './components/breadcrumb';
import { MetadataPanel } from './components/metadata-panel';
import type { BreadcrumbEntry, FileChangeEvent } from './lib/types';

export default function App() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbEntry[]>([]);

  const { features, featureIndex, loading: featuresLoading, fetchFeatures, fetchFeatureIndex } = useFeatures();
  const { diagram, loading: diagramLoading, error: diagramError, fetchDiagram } = useDiagram();

  // Fetch feature index when feature is selected
  useEffect(() => {
    if (selectedFeature) {
      fetchFeatureIndex(selectedFeature);
      setSelectedFile(null);
      setBreadcrumb([]);
    }
  }, [selectedFeature, fetchFeatureIndex]);

  // Fetch diagram when file is selected
  useEffect(() => {
    if (selectedFeature && selectedFile) {
      fetchDiagram(selectedFeature, selectedFile);
    }
  }, [selectedFeature, selectedFile, fetchDiagram]);

  const handleFeatureSelect = (name: string) => {
    setSelectedFeature(name);
  };

  const handleDiagramSelect = (file: string) => {
    setSelectedFile(file);
    setBreadcrumb([]);
  };

  // Drill-down: navigate to a child diagram
  const handleDrillDown = useCallback((targetFile: string) => {
    if (!diagram || !selectedFeature) return;

    // Push current diagram to breadcrumb
    setBreadcrumb((prev) => [
      ...prev,
      {
        diagramId: diagram.frontmatter.id,
        title: diagram.frontmatter.title,
        layer: diagram.frontmatter.layer,
        file: selectedFile!,
      },
    ]);

    setSelectedFile(targetFile);
  }, [diagram, selectedFeature, selectedFile]);

  // Live refresh on file changes
  const handleFileChange = useCallback((event: FileChangeEvent) => {
    // Re-fetch features list (might have new features or changed counts)
    fetchFeatures();

    // Re-fetch feature index if the selected feature was affected
    if (selectedFeature) {
      const affectsSelected = Object.keys(event.changes).some(
        (p) => p.startsWith(selectedFeature + '/')
      );
      if (affectsSelected) {
        fetchFeatureIndex(selectedFeature);

        // Re-fetch current diagram if it was modified
        if (selectedFile) {
          const diagramPath = `${selectedFeature}/${selectedFile}`;
          if (event.changes[diagramPath]) {
            fetchDiagram(selectedFeature, selectedFile);
          }
        }
      }
    }
  }, [selectedFeature, selectedFile, fetchFeatures, fetchFeatureIndex, fetchDiagram]);

  useWebSocket(handleFileChange);

  // Breadcrumb navigation
  const handleBreadcrumbNavigate = useCallback((index: number) => {
    if (index === -1) {
      // Navigate back to feature root (clear diagram selection)
      setSelectedFile(null);
      setBreadcrumb([]);
      return;
    }

    // Navigate to breadcrumb entry at index
    const entry = breadcrumb[index];
    setSelectedFile(entry.file);
    setBreadcrumb((prev) => prev.slice(0, index));
  }, [breadcrumb]);

  return (
    <div class="app">
      <aside class="sidebar">
        <h2>Mermaid Viewer</h2>
        {featuresLoading ? (
          <p>Loading features...</p>
        ) : (
          <>
            <FeatureList
              features={features}
              selected={selectedFeature}
              onSelect={handleFeatureSelect}
            />
            {selectedFeature && (
              <DiagramTree
                index={featureIndex}
                selectedFile={selectedFile}
                onSelect={handleDiagramSelect}
              />
            )}
          </>
        )}
      </aside>
      <main class="main-panel">
        <Breadcrumb
          entries={breadcrumb}
          featureName={selectedFeature}
          onNavigate={handleBreadcrumbNavigate}
        />
        <DiagramView
          diagram={diagram}
          loading={diagramLoading}
          error={diagramError}
          onDrillDown={handleDrillDown}
        />
      </main>
      <aside class="info-panel">
        <MetadataPanel
          frontmatter={diagram?.frontmatter ?? null}
          onNavigate={(idOrFile) => {
            // Try to resolve the id to a file — for now, use as-is
            // The metadata panel passes diagram-ids; we need to find matching files
            if (featureIndex) {
              const allDiagrams = [
                ...(featureIndex.diagrams.L0 ?? []),
                ...(featureIndex.diagrams.L1 ?? []),
                ...(featureIndex.diagrams.L2 ?? []),
              ];
              const match = allDiagrams.find((d) => d.id === idOrFile);
              if (match) {
                handleDiagramSelect(match.file);
              }
            }
          }}
        />
      </aside>
    </div>
  );
}
