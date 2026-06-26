import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — Findr` : 'Findr';
    return () => { document.title = prev; };
  }, [title]);
}
