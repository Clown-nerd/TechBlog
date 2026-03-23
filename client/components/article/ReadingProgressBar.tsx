'use client';

import { useEffect, useState } from 'react';

/**
 * Thin gold progress bar at the top of the viewport.
 * Fills left→right as the user scrolls through the article.
 */
export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 60,            /* sits just below the 60px nav */
        left: 0,
        width: `${progress}%`,
        height: 3,
        background: 'var(--gold)',
        zIndex: 199,
        transition: 'width .08s linear',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
