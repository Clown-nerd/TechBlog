'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

/* ─── TYPES ────────────────────────────────────────────────────────────────── */
interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  reading_time_minutes: number;
  view_count: number;
  published_at: string | null;
  created_at: string;
  author?: { id: number; name: string; handle: string; avatar_url: string | null };
  category?: { id: number; name: string; slug: string };
}

interface Subscriber {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  topic_preferences: string[];
  subscribed_at: string;
  is_active: boolean;
}

/* ─── SHIMMER KEYFRAMES (injected once) ────────────────────────────────────── */
const shimmerCSS = `
@keyframes adminShimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
`;

/* ─── SKELETON ─────────────────────────────────────────────────────────────── */
function Skeleton({ width, height, borderRadius = 4, style }: {
  width: string | number;
  height: string | number;
  borderRadius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: `linear-gradient(90deg, var(--border) 25%, rgba(221,216,208,0.5) 50%, var(--border) 75%)`,
        backgroundSize: '800px 100%',
        animation: 'adminShimmer 1.6s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

/* ─── STAT CARD ────────────────────────────────────────────────────────────── */
function StatCard({ label, value, subtext, trend, trendUp, color, loading }: {
  label: string;
  value: string;
  subtext: string;
  trend?: string;
  trendUp?: boolean;
  color?: string;
  loading: boolean;
}) {
  return (
    <div style={cs.statCard}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '.62rem',
        letterSpacing: '.14em',
        textTransform: 'uppercase' as const,
        color: 'var(--muted)',
        marginBottom: '.65rem',
        fontWeight: 500,
      }}>
        {label}
      </div>
      {loading ? (
        <>
          <Skeleton width={80} height={36} borderRadius={6} />
          <Skeleton width={100} height={14} borderRadius={4} style={{ marginTop: 8 }} />
        </>
      ) : (
        <>
          <div style={{
            fontFamily: "'Fraunces', serif",
            fontSize: '2.1rem',
            fontWeight: 900,
            color: color || 'var(--char)',
            letterSpacing: '-.03em',
            lineHeight: 1.1,
          }}>
            {value}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '.4rem',
            marginTop: '.45rem',
            fontSize: '.74rem',
            color: 'var(--muted)',
          }}>
            {trend && (
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '.68rem',
                fontWeight: 500,
                color: trendUp ? 'var(--green2)' : 'var(--terra)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}>
                {trendUp ? '↑' : '↓'} {trend}
              </span>
            )}
            <span>{subtext}</span>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── SECTION HEADER ───────────────────────────────────────────────────────── */
function SectionHeader({ title, accent }: { title: string; accent?: string }) {
  return (
    <div style={{
      fontFamily: "'Fraunces', serif",
      fontSize: '1.1rem',
      fontWeight: 700,
      color: 'var(--char)',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '.5rem',
    }}>
      {accent && (
        <span style={{
          width: 3,
          height: 18,
          borderRadius: 2,
          background: accent,
          flexShrink: 0,
        }} />
      )}
      {title}
    </div>
  );
}

/* ─── HELPERS ──────────────────────────────────────────────────────────────── */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function initials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

/* ─── MAIN DASHBOARD ─────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // inject shimmer keyframes
    if (!document.getElementById('admin-shimmer-style')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'admin-shimmer-style';
      styleEl.textContent = shimmerCSS;
      document.head.appendChild(styleEl);
    }

    const extractData = (res: any): any[] => {
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    };

    Promise.all([
      fetch(`${API}/api/articles`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/articles?status=draft`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/subscribers`).then(r => r.json()).catch(() => []),
    ]).then(([pubArts, draftArts, subs]) => {
      const published = extractData(pubArts);
      const drafts = extractData(draftArts);
      setArticles([...published, ...drafts]);
      setSubscribers(extractData(subs));
      setLoading(false);
    });
  }, []);

  /* derived data */
  const publishedArticles = articles.filter(a => a.status === 'published');
  const draftArticles = articles.filter(a => a.status === 'draft');
  const topArticles = [...publishedArticles].sort((a, b) => b.view_count - a.view_count).slice(0, 5);
  const maxViews = topArticles[0]?.view_count || 1;
  const recentSubscribers = [...subscribers].sort((a, b) =>
    new Date(b.subscribed_at).getTime() - new Date(a.subscribed_at).getTime()
  ).slice(0, 5);

  const totalViews = 24847; // placeholder as per spec
  const conversionRate = totalViews > 0 ? ((subscribers.length / totalViews) * 100).toFixed(1) : '0';

  /* top category */
  const catCounts: Record<string, number> = {};
  publishedArticles.forEach(a => {
    const cat = a.category?.name || 'Uncategorized';
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });
  const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  /* most viewed author */
  const authorViews: Record<string, number> = {};
  publishedArticles.forEach(a => {
    const name = a.author?.name || 'Unknown';
    authorViews[name] = (authorViews[name] || 0) + a.view_count;
  });
  const topAuthor = Object.entries(authorViews).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  /* articles this week (published in last 7 days) */
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const articlesThisWeek = publishedArticles.filter(
    a => a.published_at && new Date(a.published_at) >= oneWeekAgo
  ).length;

  /* avg reading time */
  const avgReadingTime = publishedArticles.length > 0
    ? Math.round(publishedArticles.reduce((s, a) => s + a.reading_time_minutes, 0) / publishedArticles.length)
    : 0;

  return (
    <div>
      {/* ── ROW 1: STAT CARDS ──────────────────────────── */}
      <div style={cs.statsGrid}>
        <StatCard
          label="Total Articles"
          value={publishedArticles.length.toString()}
          subtext="articles published"
          trend="+3"
          trendUp
          loading={loading}
        />
        <StatCard
          label="Monthly Views"
          value={totalViews.toLocaleString()}
          subtext="this month"
          trend="+12%"
          trendUp
          loading={loading}
        />
        <StatCard
          label="Subscribers"
          value={subscribers.length.toString()}
          subtext="this month"
          trend={`+${Math.min(subscribers.length, 4)}`}
          trendUp
          loading={loading}
        />
        <StatCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          subtext="subscribers / views"
          color="var(--gold)"
          loading={loading}
        />
      </div>

      {/* ── ROW 2: TOP STORIES + BREAKING ──────────────── */}
      <div style={cs.row2}>
        {/* LEFT: Top Performing Stories */}
        <div style={cs.card}>
          <SectionHeader title="Top Performing Stories" accent="var(--green2)" />
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} width="100%" height={42} borderRadius={6} />
              ))}
            </div>
          ) : (
            <div style={{ overflow: 'hidden' }}>
              {/* table header */}
              <div style={cs.tableHeader}>
                <span style={{ flex: 2 }}>Article</span>
                <span style={{ flex: 1.2, textAlign: 'center' }}>Views</span>
                <span style={{ flex: .8, textAlign: 'center' }}>Category</span>
                <span style={{ flex: .8, textAlign: 'right' }}>Date</span>
              </div>
              {topArticles.map(article => (
                <Link
                  key={article.id}
                  href={`/admin/articles/${article.id}/edit`}
                  style={cs.tableRow}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,67,49,.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ flex: 2, fontWeight: 500, fontSize: '.84rem', color: 'var(--char)', lineHeight: 1.4 }}>
                    {truncate(article.title, 50)}
                  </span>
                  <span style={{ flex: 1.2, display: 'flex', alignItems: 'center', gap: '.5rem', justifyContent: 'center' }}>
                    <div style={{ flex: 1, maxWidth: 80, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(article.view_count / maxViews) * 100}%`,
                        height: '100%',
                        borderRadius: 3,
                        background: 'var(--green2)',
                        transition: 'width .6s var(--ease-spring)',
                      }} />
                    </div>
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '.7rem',
                      color: 'var(--muted)',
                      minWidth: 36,
                      textAlign: 'right',
                    }}>
                      {article.view_count.toLocaleString()}
                    </span>
                  </span>
                  <span style={{ flex: .8, display: 'flex', justifyContent: 'center' }}>
                    <span style={cs.categoryPill}>{article.category?.name || '—'}</span>
                  </span>
                  <span style={{ flex: .8, textAlign: 'right', fontSize: '.74rem', color: 'var(--muted)' }}>
                    {formatDate(article.published_at)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Breaking News Queue */}
        <div style={{ ...cs.card, padding: 0, overflow: 'hidden' }}>
          <div style={cs.breakingHeader}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '.58rem',
              letterSpacing: '.18em',
              textTransform: 'uppercase' as const,
              fontWeight: 500,
            }}>
              ● BREAKING NEWS QUEUE
            </span>
          </div>
          <div style={{ padding: '1rem 1.25rem' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} width="100%" height={32} borderRadius={6} />
                ))}
              </div>
            ) : draftArticles.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                color: 'var(--muted)',
                fontSize: '.85rem',
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '.5rem', opacity: .4 }}>📰</div>
                No breaking news queued
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {draftArticles.map(article => (
                  <div key={article.id} style={cs.breakingItem}>
                    <span style={cs.breakingTag}>BREAKING</span>
                    <span style={{
                      fontSize: '.82rem',
                      fontWeight: 500,
                      color: 'var(--char)',
                      lineHeight: 1.4,
                    }}>
                      {truncate(article.title, 45)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              style={cs.addBreakingBtn}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,76,49,.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,76,49,.06)'; }}
            >
              + Add Breaking Story
            </button>
          </div>
        </div>
      </div>

      {/* ── ROW 3: THREE COLUMNS ──────────────────────── */}
      <div style={cs.row3}>
        {/* Pending Review */}
        <div style={cs.card}>
          <SectionHeader title="Pending Review" accent="var(--gold)" />
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} width="100%" height={80} borderRadius={8} />
              ))}
            </div>
          ) : draftArticles.length === 0 ? (
            <div style={cs.emptyState}>
              <div style={{ fontSize: '1.5rem', marginBottom: '.35rem', opacity: .4 }}>✅</div>
              All caught up!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {draftArticles.map(article => (
                <div key={article.id} style={cs.reviewCard}>
                  <div style={{
                    fontSize: '.85rem',
                    fontWeight: 600,
                    color: 'var(--char)',
                    marginBottom: '.3rem',
                    lineHeight: 1.4,
                  }}>
                    {article.title}
                  </div>
                  <div style={{
                    fontSize: '.72rem',
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.4rem',
                    marginBottom: '.5rem',
                  }}>
                    <span style={cs.miniAvatar}>{initials(article.author?.name || 'U')}</span>
                    {article.author?.name || 'Unknown'}
                  </div>
                  <div style={{
                    fontSize: '.78rem',
                    color: 'var(--muted)',
                    lineHeight: 1.55,
                    marginBottom: '.65rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  } as React.CSSProperties}>
                    {article.excerpt}
                  </div>
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    style={cs.reviewBtn}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.color = '#F6F4F0'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(26,67,49,.08)'; e.currentTarget.style.color = 'var(--green)'; }}
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Subscribers */}
        <div style={cs.card}>
          <SectionHeader title="Recent Subscribers" accent="var(--terra)" />
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} width="100%" height={48} borderRadius={6} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.15rem' }}>
              {recentSubscribers.map(sub => (
                <div key={sub.id} style={cs.subRow}>
                  <div style={{
                    ...cs.subAvatar,
                    background: sub.is_active ? 'var(--green)' : 'var(--muted)',
                  }}>
                    {initials(`${sub.first_name} ${sub.last_name}`)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '.82rem',
                      fontWeight: 500,
                      color: 'var(--char)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    } as React.CSSProperties}>
                      {sub.email}
                    </div>
                    <div style={{ fontSize: '.7rem', color: 'var(--muted)', display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginTop: 2 }}>
                      {sub.topic_preferences.slice(0, 2).map(t => (
                        <span key={t} style={cs.topicChip}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '.65rem',
                    color: 'var(--muted)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  } as React.CSSProperties}>
                    {formatDate(sub.subscribed_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div style={cs.card}>
          <SectionHeader title="Quick Stats" accent="var(--green)" />
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} width="100%" height={52} borderRadius={8} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
              <QuickStatItem label="Articles this week" value={articlesThisWeek.toString()} />
              <QuickStatItem label="Avg reading time" value={`${avgReadingTime} min`} />
              <QuickStatItem label="Top category" value={topCategory} />
              <QuickStatItem label="Most viewed author" value={topAuthor} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── QUICK STAT ITEM ──────────────────────────────────────────────────────── */
function QuickStatItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: 'var(--cream)',
      borderRadius: 8,
      padding: '.75rem 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '.7rem',
        letterSpacing: '.06em',
        textTransform: 'uppercase' as const,
        color: 'var(--muted)',
        fontWeight: 500,
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '.88rem',
        fontWeight: 600,
        color: 'var(--char)',
      }}>
        {value}
      </span>
    </div>
  );
}

/* ─── STYLES ───────────────────────────────────────────────────────────────── */
const cs = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.25rem',
    marginBottom: '1.75rem',
  } as React.CSSProperties,

  statCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1.25rem',
    boxShadow: 'var(--sh-card)',
    transition: 'transform .2s var(--ease-spring), box-shadow .2s',
  } as React.CSSProperties,

  row2: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1.25rem',
    marginBottom: '1.75rem',
  } as React.CSSProperties,

  row3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '1.25rem',
  } as React.CSSProperties,

  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1.25rem',
    boxShadow: 'var(--sh-card)',
  } as React.CSSProperties,

  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '.6rem',
    letterSpacing: '.12em',
    textTransform: 'uppercase' as const,
    color: 'var(--muted)',
    padding: '.5rem 0',
    borderBottom: '1px solid var(--border)',
    marginBottom: '.25rem',
    fontWeight: 500,
  } as React.CSSProperties,

  tableRow: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    padding: '.6rem 0',
    borderBottom: '1px solid rgba(221,216,208,.4)',
    transition: 'background .12s',
    cursor: 'pointer',
  } as React.CSSProperties,

  categoryPill: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '.6rem',
    letterSpacing: '.08em',
    textTransform: 'uppercase' as const,
    background: 'rgba(26,67,49,.08)',
    color: 'var(--green)',
    padding: '.18rem .55rem',
    borderRadius: 20,
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  breakingHeader: {
    background: 'var(--terra)',
    color: '#F6F4F0',
    padding: '.65rem 1.25rem',
    fontSize: '.72rem',
    fontWeight: 600,
  } as React.CSSProperties,

  breakingItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '.5rem',
    padding: '.45rem 0',
    borderBottom: '1px solid var(--border)',
  } as React.CSSProperties,

  breakingTag: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '.55rem',
    letterSpacing: '.1em',
    textTransform: 'uppercase' as const,
    background: 'rgba(200,76,49,.12)',
    color: 'var(--terra)',
    padding: '.15rem .45rem',
    borderRadius: 4,
    fontWeight: 600,
    flexShrink: 0,
    marginTop: 2,
  } as React.CSSProperties,

  addBreakingBtn: {
    width: '100%',
    background: 'rgba(200,76,49,.06)',
    border: '1.5px dashed var(--terra)',
    borderRadius: 8,
    padding: '.55rem',
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: '.78rem',
    fontWeight: 600,
    color: 'var(--terra)',
    cursor: 'pointer',
    marginTop: '.85rem',
    transition: 'background .15s',
  } as React.CSSProperties,

  reviewCard: {
    padding: '.85rem',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--cream)',
    transition: 'border-color .15s',
  } as React.CSSProperties,

  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: 'var(--green)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: '.5rem',
    fontWeight: 700,
    color: '#F6F4F0',
    flexShrink: 0,
  } as React.CSSProperties,

  reviewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '.35rem .85rem',
    fontSize: '.74rem',
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    background: 'rgba(26,67,49,.08)',
    color: 'var(--green)',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background .15s, color .15s',
    textDecoration: 'none',
    border: 'none',
  } as React.CSSProperties,

  subRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.65rem',
    padding: '.55rem .35rem',
    borderRadius: 8,
    transition: 'background .12s',
  } as React.CSSProperties,

  subAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: '.55rem',
    fontWeight: 700,
    color: '#F6F4F0',
    flexShrink: 0,
  } as React.CSSProperties,

  topicChip: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '.55rem',
    letterSpacing: '.06em',
    background: 'rgba(26,67,49,.07)',
    color: 'var(--green)',
    padding: '.1rem .4rem',
    borderRadius: 10,
  } as React.CSSProperties,

  emptyState: {
    textAlign: 'center' as const,
    padding: '2.5rem 1rem',
    color: 'var(--muted)',
    fontSize: '.85rem',
  } as React.CSSProperties,
};
