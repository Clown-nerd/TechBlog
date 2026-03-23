'use client';

import { useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Client island — fires a GET to /api/articles/:slug on mount
 * to atomically increment the view counter.
 * Renders nothing visible.
 */
export default function ViewCountIncrement({ slug }: { slug: string }) {
  useEffect(() => {
    // Fire-and-forget — we already GET the article (which increments),
    // but this ensures a dedicated view-count bump if the page was SSR-cached.
    fetch(`${API}/api/articles/${slug}`, { cache: 'no-store' }).catch(() => {});
  }, [slug]);

  return null;
}
