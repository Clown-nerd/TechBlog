import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar nav — matches style.css nav colours */}
      <aside style={{
        width: 240,
        background: 'var(--green)',
        padding: '1.5rem 1.25rem',
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '1.15rem',
          fontWeight: 900,
          color: '#F6F4F0',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{
            width: 7, height: 7,
            background: 'var(--terra)',
            borderRadius: '50%',
          }} />
          CMS
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/articles/new', label: 'New Article' },
            { href: '/admin', label: 'All Articles' },
            { href: '/admin', label: 'Categories' },
          ].map(link => (
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
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, background: 'var(--cream)', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
