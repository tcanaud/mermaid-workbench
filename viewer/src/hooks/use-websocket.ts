import { useEffect, useRef } from 'preact/hooks';
import type { FileChangeEvent } from '../lib/types';

type ChangeHandler = (event: FileChangeEvent) => void;

export function useWebSocket(onFileChange: ChangeHandler) {
  const handlerRef = useRef(onFileChange);
  handlerRef.current = onFileChange;

  useEffect(() => {
    if (!import.meta.hot) return;

    const handleChange = (data: FileChangeEvent) => {
      handlerRef.current(data);
    };

    import.meta.hot.on('mermaid:file-change', handleChange);

    import.meta.hot.on('mermaid:connected', (data: { watchDir: string }) => {
      console.log('[mermaid-viewer] Connected, watching:', data.watchDir);
    });
  }, []);
}
