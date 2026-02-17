import { useState, useEffect, useCallback } from 'preact/hooks';
import type { Feature, FeatureIndex } from '../lib/types';

export function useFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [featureIndex, setFeatureIndex] = useState<FeatureIndex | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFeatures = useCallback(async () => {
    try {
      const res = await fetch('/api/features');
      const data = await res.json();
      setFeatures(data.features);
    } catch (err) {
      console.error('Failed to fetch features:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeatureIndex = useCallback(async (name: string) => {
    try {
      const res = await fetch(`/api/features/${name}`);
      if (res.ok) {
        const data = await res.json();
        setFeatureIndex(data);
      } else {
        setFeatureIndex(null);
      }
    } catch (err) {
      console.error('Failed to fetch feature index:', err);
      setFeatureIndex(null);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  return { features, featureIndex, loading, fetchFeatures, fetchFeatureIndex };
}
