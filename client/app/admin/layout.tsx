'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ─── SVG ICONS ────────────────────────────────────────────────────────────── */
const icons: Record<string, React.ReactNode> = {
  grid: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  document: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  image: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  broadcast: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
      <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
    </svg>
  ),
  chat: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  mail: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  chart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  person: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  gear: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  search: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  chevron: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

/* ─── NAV ITEMS ────────────────────────────────────────────────────────────── */
interface NavItem {
  href: string;
  label: string;
  icon: string;
}
interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'CONTENT',
    items: [
      { href: '/admin', label: 'Dashboard', icon: 'grid' },
      { href: '/admin/articles', label: 'Articles', icon: 'document' },
      { href: '/admin/media', label: 'Media', icon: 'image' },
      { href: '/admin/live', label: 'Live Feed', icon: 'broadcast' },
    ],
  },
  {
    title: 'AUDIENCE',
    items: [
      { href: '/admin/comments', label: 'Comments', icon: 'chat' },
      { href: '/admin/subscribers', label: 'Subscribers', icon: 'mail' },
      { href: '/admin/analytics', label: 'Analytics', icon: 'chart' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { href: '/admin/users', label: 'Users', icon: 'person' },
      { href: '/admin/settings', label: 'Settings', icon: 'gear' },
    ],
  },
];

/* ─── PAGE TITLE MAP ───────────────────────────────────────────────────────── */
const pageTitleMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/articles': 'Articles',
  '/admin/media': 'Media',
  '/admin/live': 'Live Feed',
  '/admin/comments': 'Comments',
  '/admin/subscribers': 'Subscribers',
  '/admin/analytics': 'Analytics',
  '/admin/users': 'Users',
  '/admin/settings': 'Settings',
};

/* ─── STYLES ───────────────────────────────────────────────────────────────── */
const s = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    overflow: 'hidden',
  } as React.CSSProperties,

  sidebar: {
    width: 240,
    flexShrink: 0,
    background: 'var(--green)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
    overflowY: 'auto',
  } as React.CSSProperties,

  sidebarInner: {
    padding: '1.5rem 1rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  logo: {
    fontFamily: "'Fraunces', serif",
    fontSize: '1.1rem',
    fontWeight: 900,
    color: '#F6F4F0',
    letterSpacing: '-.02em',
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    padding: '0 .65rem',
    marginBottom: '1.75rem',
    cursor: 'pointer',
    textDecoration: 'none',
  } as React.CSSProperties,

  liveDot: {
    width: 7,
    height: 7,
    background: 'var(--terra)',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
    flexShrink: 0,
  } as React.CSSProperties,

  groupLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '.58rem',
    letterSpacing: '.18em',
    textTransform: 'uppercase',
    color: 'var(--gold)',
    marginTop: '1.5rem',
    marginBottom: '.5rem',
    padding: '0 .65rem',
    fontWeight: 500,
  } as React.CSSProperties,

  navItem: (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '.65rem',
    padding: '.52rem .65rem',
    fontSize: '.82rem',
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: 500,
    color: isActive ? '#F6F4F0' : 'rgba(246,244,240,0.72)',
    background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
    borderRadius: '0 6px 6px 0',
    cursor: 'pointer',
    transition: 'background .15s, color .15s',
    textDecoration: 'none',
    marginLeft: -1,
  }),

  contentWrap: {
    marginLeft: 240,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  } as React.CSSProperties,

  header: {
    height: 60,
    background: 'var(--char)',
    borderBottom: '2.5px solid var(--gold)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.75rem',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    zIndex: 90,
  } as React.CSSProperties,

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  } as React.CSSProperties,

  pageTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#F6F4F0',
    letterSpacing: '-.02em',
  } as React.CSSProperties,

  searchWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,

  searchIcon: {
    position: 'absolute',
    left: 12,
    color: 'var(--muted)',
    display: 'flex',
    pointerEvents: 'none',
  } as React.CSSProperties,

  searchInput: {
    width: 320,
    height: 36,
    padding: '0 .75rem 0 2.4rem',
    background: 'var(--surface)',
    border: '1.5px solid var(--border)',
    borderRadius: 8,
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: '.82rem',
    color: 'var(--char)',
    outline: 'none',
    transition: 'border-color .18s',
  } as React.CSSProperties,

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '.9rem',
  } as React.CSSProperties,

  quickCreate: {
    position: 'relative',
  } as React.CSSProperties,

  quickCreateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    background: 'var(--terra)',
    color: '#F6F4F0',
    border: 'none',
    padding: '.42rem 1rem .42rem .85rem',
    borderRadius: 8,
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: '.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background .18s',
    letterSpacing: '.02em',
  } as React.CSSProperties,

  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    right: 0,
    background: 'var(--surface)',
    border: '1.5px solid var(--border)',
    borderRadius: 10,
    boxShadow: 'var(--sh-float)',
    minWidth: 190,
    padding: '.35rem 0',
    zIndex: 200,
  } as React.CSSProperties,

  dropdownItem: {
    display: 'block',
    padding: '.55rem 1rem',
    fontSize: '.82rem',
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: 500,
    color: 'var(--char)',
    textDecoration: 'none',
    transition: 'background .12s',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left',
  } as React.CSSProperties,

  bellWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: '50%',
    cursor: 'pointer',
    color: 'rgba(246,244,240,.72)',
    transition: 'background .15s, color .15s',
  } as React.CSSProperties,

  bellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--terra)',
    border: '2px solid var(--char)',
  } as React.CSSProperties,

  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'var(--green2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: '.72rem',
    fontWeight: 700,
    color: '#F6F4F0',
    cursor: 'pointer',
    transition: 'box-shadow .15s',
    border: '2px solid rgba(255,255,255,.18)',
    flexShrink: 0,
  } as React.CSSProperties,

  mainContent: {
    flex: 1,
    background: 'var(--cream)',
    overflowY: 'auto',
    padding: '2rem 2.25rem',
  } as React.CSSProperties,
};

/* ─── COMPONENT ────────────────────────────────────────────────────────────── */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [quickOpen, setQuickOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const quickRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  /* close dropdowns on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setQuickOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* derive page title from pathname */
  const pageTitle = (() => {
    const exact = pageTitleMap[pathname];
    if (exact) return exact;
    if (pathname.startsWith('/admin/articles')) return 'Articles';
    if (pathname.startsWith('/admin/media')) return 'Media';
    if (pathname.startsWith('/admin/live')) return 'Live Feed';
    return 'Dashboard';
  })();

  /* check active nav */
  const isActive = (href: string): boolean => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div style={s.shell}>
      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside style={s.sidebar}>
        <div style={s.sidebarInner as React.CSSProperties}>
          <Link href="/admin" style={s.logo}>
            <span style={s.liveDot} />
            Bash n Build CMS
          </Link>

          {navGroups.map((group, gi) => (
            <div key={gi}>
              <div style={{ ...s.groupLabel, marginTop: gi === 0 ? '.5rem' : '1.5rem' } as React.CSSProperties}>
                {group.title}
              </div>
              {group.items.map(item => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  style={s.navItem(isActive(item.href))}
                  onMouseEnter={e => {
                    if (!isActive(item.href)) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive(item.href)) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ display: 'flex', opacity: isActive(item.href) ? 1 : 0.72 }}>
                    {icons[item.icon]}
                  </span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* ── CONTENT AREA ────────────────────────────────── */}
      <div style={s.contentWrap as React.CSSProperties}>
        {/* ── HEADER ──────────────────────────────────────── */}
        <header style={s.header}>
          <div style={s.headerLeft}>
            <h1 style={s.pageTitle}>{pageTitle}</h1>
            <div style={s.searchWrap as React.CSSProperties}>
              <span style={s.searchIcon as React.CSSProperties}>{icons.search}</span>
              <input
                type="text"
                placeholder="Search articles, media, users..."
                style={s.searchInput}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
            </div>
          </div>

          <div style={s.headerRight}>
            {/* Quick Create */}
            <div ref={quickRef} style={s.quickCreate as React.CSSProperties}>
              <button
                style={s.quickCreateBtn}
                onClick={() => setQuickOpen(prev => !prev)}
                onMouseEnter={e => { e.currentTarget.style.background = '#a83c28'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--terra)'; }}
              >
                {icons.plus}
                Quick Create
                {icons.chevron}
              </button>
              {quickOpen && (
                <div style={s.dropdown as React.CSSProperties}>
                  {[
                    { href: '/admin/articles/new', label: 'New Article' },
                    { href: '/admin/media/upload', label: 'Upload Media' },
                    { href: '/admin/live/new', label: 'New Live Post' },
                  ].map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={s.dropdownItem}
                      onClick={() => setQuickOpen(false)}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,67,49,.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Bell */}
            <div
              style={s.bellWrap as React.CSSProperties}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {icons.bell}
              <span style={s.bellBadge as React.CSSProperties} />
            </div>

            {/* Avatar */}
            <div ref={avatarRef} style={{ position: 'relative' } as React.CSSProperties}>
              <div
                style={s.avatarCircle}
                onClick={() => setAvatarOpen(prev => !prev)}
              >
                JM
              </div>
              {avatarOpen && (
                <div style={{ ...s.dropdown, right: 0 } as React.CSSProperties}>
                  {[
                    { href: '/admin/settings', label: 'Profile' },
                    { href: '/admin/settings', label: 'Settings' },
                  ].map(item => (
                    <Link
                      key={item.label}
                      href={item.href}
                      style={s.dropdownItem}
                      onClick={() => setAvatarOpen(false)}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,67,49,.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div style={{ height: 1, background: 'var(--border)', margin: '.2rem 0' }} />
                  <button
                    style={{ ...s.dropdownItem, color: 'var(--terra)' }}
                    onClick={() => setAvatarOpen(false)}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,76,49,.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT ────────────────────────────────── */}
        <main style={s.mainContent as React.CSSProperties}>
          {children}
        </main>
      </div>
    </div>
  );
}
