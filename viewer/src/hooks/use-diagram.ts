import { useState, useCallback } from 'preact/hooks';
import type { Diagram } from '../lib/types';

export function useDiagram() {
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagram = useCallback(async (featureName: string, file: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/features/${featureName}/diagrams/${file}`);
      if (res.ok) {
        const data = await res.json();
        setDiagram(data);
      } else {
        const err = await res.json();
        setError(err.message ?? 'Diagram not found');
        setDiagram(null);
      }
    } catch (err) {
      setError('Failed to fetch diagram');
      setDiagram(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { diagram, loading, error, fetchDiagram };
}
