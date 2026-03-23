'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SearchInput from '@/components/search/SearchInput';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

interface SearchResult {
  id: number;
  slug: string;
  title: string;
  headline: string;
  excerpt: string;
  cover_image_url: string | null;
  category_name: string;
  category_slug: string;
  author_name: string;
  published_at: string;
  reading_time_minutes: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

// Skeletons shown while data is loading
function SkeletonItem() {
  return (
    <div className="sr-item" style={{ pointerEvents: 'none' }}>
      <div className="sr-img" style={{ background: 'var(--border)' }} />
      <div className="sr-body" style={{ padding: '1.1rem 1.1rem 1.1rem 0' }}>
        <div style={{ width: '35%', height: 12, background: 'var(--border)', borderRadius: 4, marginBottom: 10 }} />
        <div style={{ width: '90%', height: 20, background: 'var(--border)', borderRadius: 4, marginBottom: 10 }} />
        <div style={{ width: '100%', height: 14, background: 'var(--border)', borderRadius: 4, marginBottom: 6 }} />
        <div style={{ width: '80%', height: 14, background: 'var(--border)', borderRadius: 4, marginBottom: 14 }} />
        <div style={{ width: '55%', height: 12, background: 'var(--border)', borderRadius: 4 }} />
      </div>
    </div>
  );
}

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';

  const [categories, setCategories] = useState<Category[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [everSearched, setEverSearched] = useState(false);

  // Fetch categories once for filter pills
  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : (data.data ?? [])))
      .catch(() => {});
  }, []);

  // Fetch results whenever q or category changes
  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const url = new URL(`${API}/api/search`);
    url.searchParams.set('q', q);
    if (category) url.searchParams.set('category', category);

    fetch(url.toString(), { signal: controller.signal })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(json => {
        setResults(json.data ?? []);
        setTotalCount(json.meta?.total_count ?? 0);
        setEverSearched(true);
      })
      .catch(err => { if (err.name !== 'AbortError') console.error(err); })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [q, category]);

  const setCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === category) {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    router.replace(`/search?${params.toString()}`);
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <SearchInput defaultValue={q} />

      {/* Meta line */}
      <p className="search-meta">
        {q.trim().length < 2
          ? 'Enter at least 2 characters to search'
          : loading
            ? `Searching for "${q}"…`
            : `Showing ${totalCount} result${totalCount !== 1 ? 's' : ''} for "${q}"`}
      </p>

      {/* Category filter pills */}
      <div className="search-filters">
        <span
          className={`filter-pill${!category ? ' active' : ''}`}
          onClick={() => setCategory('')}
        >
          All
        </span>
        {categories.map(cat => (
          <span
            key={cat.id}
            className={`filter-pill${category === cat.slug ? ' active' : ''}`}
            onClick={() => setCategory(cat.slug)}
          >
            {cat.name}
          </span>
        ))}
      </div>

      {/* Results */}
      <div className="search-results">
        {loading ? (
          <>
            <SkeletonItem /><SkeletonItem /><SkeletonItem />
          </>
        ) : q.trim().length >= 2 && everSearched && results.length === 0 ? (
          /* Empty state */
          <div style={{ padding: '3rem 0', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: '1.3rem', color: 'var(--char)', marginBottom: '.75rem' }}>
              No results for "{q}"
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: '2rem' }}>
              Try broader search terms, or explore a category below.
            </p>
            <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {categories.slice(0, 6).map(cat => (
                <span
                  key={cat.id}
                  className="filter-pill"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setCategory(cat.slug)}
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>
        ) : (
          results.map(art => (
            <Link
              key={art.id}
              href={`/articles/${art.slug}`}
              className="sr-item"
              style={{ display: 'grid', textDecoration: 'none' }}
            >
              <div
                className="sr-img"
                style={art.cover_image_url ? {
                  backgroundImage: `url(${art.cover_image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                } : undefined}
              />
              <div className="sr-body">
                <div className="sr-tag">{art.category_name}</div>
                {/* Use ts_headline for highlighted excerpt when available */}
                <div
                  className="sr-title"
                  dangerouslySetInnerHTML={{ __html: art.title }}
                />
                <p
                  className="sr-excerpt"
                  dangerouslySetInnerHTML={{ __html: art.headline ?? art.excerpt }}
                />
                <div className="sr-meta">
                  {art.author_name} · {fmt(art.published_at)} · {art.reading_time_minutes} min read
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="search-pg">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="art-page-title" style={{ fontSize: '2rem', marginBottom: '.25rem' }}>Search</h1>
      </div>
      {/* Suspense is required by Next.js whenever useSearchParams is used in a child */}
      <Suspense fallback={
        <div>
          <div className="search-bar-wrap">
            <span className="search-icon">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input className="search-bar" type="search" placeholder="Search articles, guides, tutorials..." />
          </div>
          <p className="search-meta">Loading…</p>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}
