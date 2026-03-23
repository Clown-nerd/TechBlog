import Link from 'next/link';

export default function AuthorPage() {
  return (
    <div className="page active" id="page-author">
      <div className="author-hero">
        <div className="breadcrumb" style={{ marginBottom: '1.5rem' }}>
          <Link href="/">Home</Link><span>/</span><span>Authors</span><span>/</span><span style={{ color: 'var(--char)' }}>James Mwangi</span>
        </div>
        <div className="author-header">
          <div className="author-ava-lg">JM</div>
          <div>
            <h1 className="author-name">James Mwangi</h1>
            <div className="author-handle">@jmwangi_dev</div>
            <p className="author-bio-pg">Staff Engineer at iHub Labs. I build distributed systems for East African startups
              and mentor engineers in the Nairobi tech community. Kubernetes nerd, Go enthusiast, occasional coffee snob.
            </p>
            <div className="expertise-chips">
              <span className="chip">Kubernetes</span>
              <span className="chip">GCP</span>
              <span className="chip">Python</span>
              <span className="chip">Go</span>
              <span className="chip">Terraform</span>
              <span className="chip">CI/CD</span>
            </div>
            <div className="author-stats">
              <div>
                <div className="astat-val">24</div>
                <div className="astat-lbl">Articles</div>
              </div>
              <div>
                <div className="astat-val">48K</div>
                <div className="astat-lbl">Total Views</div>
              </div>
              <div>
                <div className="astat-val">2019</div>
                <div className="astat-lbl">Member Since</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="author-articles">
        <h2 className="section-h2-sm">Articles by James Mwangi</h2>
        <div className="author-arts-grid">
          {[
            { tag: '⚙ DevOps', title: 'Deploying a Zero-Downtime Kubernetes Cluster on GKE', meta: 'Feb 28, 2025 · 14 min · 2,840 views', gradient: 'linear-gradient(135deg,#091a10,var(--green))' },
            { tag: '🔧 CI/CD', title: 'GitHub Actions for FastAPI on Cloud Run', meta: 'Jan 14, 2025 · 9 min · 1,920 views', gradient: 'linear-gradient(135deg,#091a10,#1e3a28)' },
            { tag: '🐳 Docker', title: 'Optimising Docker Images for African Bandwidth', meta: 'Dec 5, 2024 · 7 min · 1,580 views', gradient: 'linear-gradient(135deg,#0a0a1a,#16213e)' }
          ].map((art, i) => (
            <Link href="/search" key={i} className="art-main" style={{ cursor: 'pointer', display: 'block', textDecoration: 'none' }}>
              <div className="art-img" style={{ height: 160, background: art.gradient }}>
                <div className="dots"></div>
              </div>
              <div className="art-body">
                <div className="art-tag">{art.tag}</div>
                <h3 className="art-title" style={{ fontSize: '1.1rem' }}>{art.title}</h3>
                <div className="art-meta">{art.meta}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
