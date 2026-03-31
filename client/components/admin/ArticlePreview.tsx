'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ArticleFormData } from './EditorSidebar';

// ── Google Fonts link (must match layout.tsx) ─────────────────────────────
const FONTS_LINK =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap';

// ── globals.css is fetched once and cached at module level ────────────────
let cachedCss: string | null = null;
async function getGlobalsCss(): Promise<string> {
  if (cachedCss !== null) return cachedCss;
  try {
    const res = await fetch('/globals.css');
    cachedCss = await res.text();
  } catch {
    cachedCss = '';
  }
  return cachedCss;
}

// ── helpers ───────────────────────────────────────────────────────────────
function getInitials(name: string): string {
  if (!name) return 'AU';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function buildSrcdoc(opts: {
  css: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  authorName: string;
  readingTime: number;
}): string {
  const { css, title, excerpt, body, category, authorName, readingTime } = opts;
  const initials = getInitials(authorName);
  const safeTitle = title || 'Untitled Article';
  const safeExcerpt = excerpt || '';
  const safeAuthor = authorName || 'Author';
  const safeCategory = category || 'General';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="${FONTS_LINK}" rel="stylesheet">
  <style>
${css}
    /* preview-only resets */
    body { margin: 0; padding: 0; overflow-x: hidden; }
    body::before { display: none; }
    .art-page-wrap { max-width: 100%; }
    .art-img-hero { margin-bottom: 2rem; }
  </style>
</head>
<body>
  <div class="art-page-wrap" style="padding: 2rem 1.5rem;">
    <div class="art-cat-pill">${safeCategory}</div>
    <h1 class="art-page-title" style="margin-top: 0.5rem;">${safeTitle}</h1>
    ${safeExcerpt ? `<p class="art-lead">${safeExcerpt}</p>` : ''}
    <div class="art-byline">
      <div class="byline-avatar">${initials}</div>
      <div class="byline-name">${safeAuthor}</div>
      <span>${readingTime} min read</span>
    </div>
    <div class="art-img-hero" style="margin-top: 1.5rem;">
      <div class="geo"></div>
      <div class="art-img-hero-label">${safeTitle}</div>
    </div>
    <div class="prose">${body || '<p style="color: var(--muted); font-style: italic;">Start writing to see a preview…</p>'}</div>
  </div>
</body>
</html>`;
}

// ── Props ─────────────────────────────────────────────────────────────────
interface ArticlePreviewProps {
  form: ArticleFormData;
  body: string;
  authors: any[];
  categories: any[];
}

export default function ArticlePreview({ form, body, authors, categories }: ArticlePreviewProps) {
  const [css, setCss] = useState('');
  const [srcdoc, setSrcdoc] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch globals.css once
  useEffect(() => {
    getGlobalsCss().then(setCss);
  }, []);

  // Derive display names
  const authorName = (() => {
    if (!form.author_id) return 'Author';
    const a = authors.find(x => x.id === form.author_id);
    return a?.name || 'Author';
  })();

  const categoryName = (() => {
    if (!form.category_id) return 'General';
    const c = categories.find(x => x.id === form.category_id);
    return c?.name || c?.slug || 'General';
  })();

  // Debounced srcdoc rebuild
  const rebuild = useCallback(() => {
    if (!css) return;
    setSrcdoc(
      buildSrcdoc({
        css,
        title: form.title,
        excerpt: form.excerpt || '',
        body,
        category: categoryName,
        authorName,
        readingTime: form.reading_time_minutes || 1,
      })
    );
  }, [css, form.title, form.excerpt, form.reading_time_minutes, body, categoryName, authorName]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(rebuild, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [rebuild]);

  return (
    <div className="preview-panel">
      {/* Desktop viewport */}
      <div className="preview-viewport-wrap">
        <div className="preview-viewport-label">DESKTOP</div>
        <div className="preview-viewport preview-viewport--desktop">
          <iframe
            title="Desktop Preview"
            srcDoc={srcdoc}
            className="preview-iframe preview-iframe--desktop"
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      {/* Mobile viewport */}
      <div className="preview-viewport-wrap">
        <div className="preview-viewport-label">MOBILE</div>
        <div className="preview-viewport preview-viewport--mobile-outer">
          <div className="preview-mobile-shell">
            <iframe
              title="Mobile Preview"
              srcDoc={srcdoc}
              className="preview-iframe preview-iframe--mobile"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
