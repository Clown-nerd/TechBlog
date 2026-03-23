'use client';

import Link from 'next/link';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/articles/new', label: 'New Article' },
  { href: '/admin', label: 'All Articles' },
  { href: '/admin/subscribers', label: 'Subscribers' },
  { href: '/admin', label: 'Categories' },
];

export default function AdminNavLinks() {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
      {links.map(link => (
        <Link
          key={link.label}
          href={link.href}
          style={{
            display: 'block',
            padding: '.55rem .85rem',
            fontSize: '.82rem',
            fontWeight: 500,
            color: 'rgba(246,244,240,.65)',
            borderRadius: 8,
            transition: 'background .15s, color .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,.08)';
            e.currentTarget.style.color = 'var(--gold)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(246,244,240,.65)';
          }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
