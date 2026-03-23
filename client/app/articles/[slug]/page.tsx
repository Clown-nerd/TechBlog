import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { generateToc } from '@/lib/tocParser';
import { parseArticleBody } from '@/lib/articleBodyParser';

import ArticleBody from '@/components/article/ArticleBody';
import ReadingProgressBar from '@/components/article/ReadingProgressBar';
import ViewCountIncrement from '@/components/article/ViewCountIncrement';

// ── Config ─────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Data fetcher ───────────────────────────────────────────────────────────
async function getArticle(slug: string) {
  const res = await fetch(`${API}/api/articles/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data || json;
}

// ── Metadata ───────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'Article Not Found' };

  return {
    title: `${article.title} — Bash n Build`,
    description: article.excerpt || '',
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      type: 'article',
      ...(article.cover_image_url && { images: [article.cover_image_url] }),
    },
  };
}

// ── Helper: format date ────────────────────────────────────────────────────
function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Helper: author initials ────────────────────────────────────────────────
function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── Page component (server) ────────────────────────────────────────────────
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  // Parse body: inject heading IDs + extract TOC
  const { toc, html: bodyWithIds } = generateToc(article.body || '');

  // Split on [VIDEO:…] markers and sanitise each HTML segment
  const bodySegments = parseArticleBody(bodyWithIds);

  const authorName = article.author_name || 'Bash n Build';
  const categoryName = article.category_name || '';
  const tags: string[] = article.tags || [];
  const viewCount = (article.view_count || 0).toLocaleString();

  return (
    <>
      {/* ---- Reading progress bar (client) ---- */}
      <ReadingProgressBar />

      {/* ---- View count increment (client) ---- */}
      <ViewCountIncrement slug={slug} />

      <div className="art-page-wrap">
        {/* ── Breadcrumb ── */}
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          {categoryName && (
            <>
              <Link href={`/categories/${article.category_slug || ''}`}>
                {categoryName}
              </Link>
              <span>/</span>
            </>
          )}
          <span style={{ color: 'var(--char)' }}>{article.title}</span>
        </nav>

        {/* ═══ Three-column grid ═══ */}
        <div className="art-3col">
          {/* ── LEFT: Table of Contents ── */}
          <aside className="art-toc-wrap">
            <div className="toc-title">On this page</div>
            <ul className="toc-list">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={item.level === 3 ? 'h3-toc' : ''}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* ── CENTER: Article ── */}
          <article>
            {/* Header */}
            <div className="art-header">
              {categoryName && (
                <div className="art-cat-pill">
                  {categoryName}
                </div>
              )}

              <h1 className="art-page-title">{article.title}</h1>

              {article.excerpt && (
                <p className="art-lead">{article.excerpt}</p>
              )}

              {/* Byline */}
              <div className="art-byline">
                <div className="byline-avatar">{initials(authorName)}</div>
                <div>
                  <div className="byline-name">{authorName}</div>
                </div>
                {article.published_at && (
                  <span>{fmtDate(article.published_at)}</span>
                )}
                <span>·</span>
                <span>{article.reading_time_minutes || '?'} min read</span>
                <span>·</span>
                <span>{viewCount} views</span>
                {tags.length > 0 && (
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '.35rem' }}>
                    {tags.slice(0, 3).map((t: string) => (
                      <span key={t} className="pill">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Hero image */}
            {article.cover_image_url ? (
              <div className="art-img-hero" style={{ position: 'relative', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.cover_image_url}
                  alt={article.title}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            ) : (
              <div className="art-img-hero">
                <div className="geo" />
              </div>
            )}

            {/* ── Article body (client component for video embeds) ── */}
            <ArticleBody segments={bodySegments} />

            {/* ── Author bio card ── */}
            <div className="author-bio-card">
              <div className="bio-avatar">{initials(authorName)}</div>
              <div>
                <div className="bio-name">{authorName}</div>
                {article.author_bio && (
                  <p className="bio-text">{article.author_bio}</p>
                )}
              </div>
            </div>
          </article>

          {/* ── RIGHT: Sidebar rail ── */}
          <aside className="art-rail">
            {/* Tags */}
            {tags.length > 0 && (
              <div className="rail-card">
                <div className="rail-title">Tags</div>
                {tags.map((t: string) => (
                  <span key={t} className="rail-tag">{t}</span>
                ))}
              </div>
            )}

            {/* Share */}
            <div className="rail-card">
              <div className="rail-title">Share</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.55rem', marginTop: '.25rem' }}>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`https://bashnbuild.co.ke/articles/${slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '.8rem', color: 'var(--muted)' }}
                >
                  Twitter / X →
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://bashnbuild.co.ke/articles/${slug}`)}&title=${encodeURIComponent(article.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '.8rem', color: 'var(--muted)' }}
                >
                  LinkedIn →
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(article.title + ' https://bashnbuild.co.ke/articles/' + slug)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '.8rem', color: 'var(--muted)' }}
                >
                  WhatsApp →
                </a>
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className="rail-card" style={{ background: 'var(--green)', borderColor: 'transparent' }}>
              <div className="rail-title" style={{ color: 'var(--gold)', borderColor: 'rgba(255,255,255,.1)' }}>
                Newsletter
              </div>
              <p style={{ fontSize: '.8rem', color: 'rgba(246,244,240,.65)', lineHeight: 1.6, marginBottom: '.75rem' }}>
                Get guides like this every Friday.
              </p>
              <Link
                href="/subscribe"
                className="btn-primary"
                style={{ width: '100%', padding: '.65rem', fontSize: '.82rem', display: 'block', textAlign: 'center' }}
              >
                Subscribe Free
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
