import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  // Format slug for title
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="page active" id="page-category">
      <div className="cat-hero">
        <div className="cat-hero-inner">
          <div className="cat-hero-label">Category</div>
          <h1 className="cat-hero-title">{title}</h1>
          <p className="cat-hero-sub">Infrastructure, containers, CI/CD, and everything you need to ship Kenyan software to
            the world.</p>
        </div>
      </div>
      <div className="feed-layout">
        <div>
          <div className="feed-filters">
            <span className="filter-pill active">All</span>
            <span className="filter-pill">Kubernetes</span>
            <span className="filter-pill">GCP</span>
            <span className="filter-pill">CI/CD</span>
            <span className="filter-pill">Docker</span>
            <span className="filter-pill">Terraform</span>
          </div>
          <div className="feed-list">
            {[
              { tag: '⚙ DevOps', title: 'Deploying a Zero-Downtime Kubernetes Cluster on Google Cloud from iHub', meta: 'James Mwangi · Feb 28, 2025 · 14 min read', gradient: 'linear-gradient(135deg,#091a10,var(--green))' },
              { tag: '🔧 CI/CD', title: 'Building a GitHub Actions Pipeline for FastAPI on Cloud Run — Kenya Edition', meta: 'Samuel Kariuki · Feb 18, 2025 · 9 min read', gradient: 'linear-gradient(135deg,#1a0e00,#3d2600)' },
              { tag: '☁ Cloud', title: 'Infrastructure as Code with Terraform: Lessons from Deploying M-Pesa Microservices', meta: 'Patricia Njeri · Feb 10, 2025 · 11 min read', gradient: 'linear-gradient(135deg,#0a0a1a,#16213e)' },
              { tag: '🐳 Docker', title: 'Optimising Docker Images for East African Bandwidth Constraints', meta: 'Eric Mwenda · Jan 30, 2025 · 7 min read', gradient: 'linear-gradient(135deg,#0f1a10,#1e3a28)' },
              { tag: '📊 Monitoring', title: "Setting Up Prometheus + Grafana for Your Kenyan Startup's API", meta: 'Jane Wachira · Jan 22, 2025 · 8 min read', gradient: 'linear-gradient(135deg,#1a0a0a,#3a1a1a)' }
            ].map((feed, i) => (
              <Link href="/search" key={i} className="feed-item" style={{ display: 'grid', textDecoration: 'none' }}>
                <div className="feed-item-img" style={{ background: feed.gradient }}></div>
                <div className="feed-item-body">
                  <div className="fi-tag">{feed.tag}</div>
                  <div className="fi-title">{feed.title}</div>
                  <div className="fi-meta">{feed.meta}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <aside className="feed-sidebar">
          <div className="sidebar-widget">
            <div className="sw-title">Trending This Week</div>
            {[
              'M-Pesa Daraja 2.0 Migration Guide',
              'Swahili NLP on a Budget',
              'KE Data Protection Compliance Checklist',
              'Kubernetes GKE Zero-Downtime Deploy'
            ].map((t, i) => (
              <div key={i} className="trending-item">
                <div className="trending-num">{i + 1}</div>
                <div className="trending-title">{t}</div>
              </div>
            ))}
          </div>
          <div className="sidebar-widget">
            <div className="sw-title">All Categories</div>
            <div className="cat-pills">
              {['DevOps', 'Cybersecurity', 'AI & ML', 'Fintech', 'Mobile', 'Startups', 'Data Eng', 'Software Eng'].map((cat, i) => (
                <Link href={`/categories/${cat.toLowerCase().replace(/ & | /g, '-')}`} key={i} className="cat-pill-sm" style={{ display: 'inline-block', textDecoration: 'none' }}>{cat}</Link>
              ))}
            </div>
          </div>
          <div className="sidebar-widget" style={{ background: 'var(--green)', borderColor: 'transparent' }}>
            <div className="sw-title" style={{ color: 'var(--gold)', borderColor: 'rgba(255,255,255,.1)' }}>Newsletter</div>
            <p style={{ fontSize: '.82rem', color: 'rgba(246,244,240,.65)', lineHeight: 1.65, marginBottom: '1rem' }}>
              Weekly digest of Kenya's best tech content.
            </p>
            <Link href="/subscribe" className="btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '.65rem', fontSize: '.82rem' }}>
              Subscribe Free →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
