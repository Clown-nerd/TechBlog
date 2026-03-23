import Link from 'next/link';
import CopyButton from '@/components/CopyButton';

export default function Home() {
  return (
    <div className="page active" id="page-home">
      {/* TICKER */}
      <div className="ticker-bar">
        <span className="ticker-label">Breaking</span>
        <div className="ticker-track" id="ticker" style={{ animationDuration: '32s' }}>
          {[...Array(2)].map((_, idx) => (
            <span key={idx} style={{ display: 'contents' }}>
              <span className="ticker-item">Safaricom launches M-Pesa API 3.0 with improved rate limits and webhooks</span>
              <span className="ticker-item">Kenya ranked #3 in African tech ecosystem index 2025</span>
              <span className="ticker-item">iHub Nairobi announces Silicon Savannah Summit for Q3 2025</span>
              <span className="ticker-item">Kenya Data Protection Authority releases new compliance guidelines</span>
              <span className="ticker-item">Flutterwave receives DORA licence in Kenya — open banking era begins</span>
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <div className="hero">
        <div className="hero-left">
          <div className="hero-inner">
            <p className="hero-eyebrow">Silicon Savannah · Est. 2024</p>
            <h1 className="hero-h1">Where Kenyan<br />Builders Come<br />to <em>Grow.</em></h1>
            <p className="hero-sub">
              Deep technical guides, startup intelligence, and the stories shaping the future of African
              technology — written by engineers for engineers.
            </p>
            <div className="hero-btns">
              <Link href="/search" className="btn-primary">Read Latest →</Link>
              <Link href="/subscribe" className="btn-ghost">Weekly Digest</Link>
            </div>
          </div>
        </div>
        <div className="hero-right">
          {/* Featured Article */}
          <Link href="/search" className="feat-card" style={{ display: 'block' }}>
            <div className="feat-card-img">
              <div className="geo"></div>
              <span className="feat-tag">In-Depth Guide</span>
            </div>
            <div className="feat-body">
              <p className="feat-tag" style={{ background: 'none', color: 'var(--terra)', padding: 0, borderRadius: 0, marginBottom: '.5rem', fontSize: '.65rem' }}>
                ⚙ DevOps &amp; Cloud
              </p>
              <p className="feat-title">Building Scalable MPESA Daraja Integrations with Python FastAPI</p>
              <div className="feat-meta">
                <span>James Kamau</span><span>·</span><span>Mar 3, 2025</span><span>·</span><span>12 min</span>
              </div>
            </div>
          </Link>
          {/* Side list */}
          <div className="side-cards">
            {[
              { num: '01', tag: '🔒 Cybersecurity', title: "Kenya's Data Protection Act: A Developer's Compliance Checklist", meta: 'Amina Ochieng · 7 min' },
              { num: '02', tag: '🚀 Startups', title: "The Nairobi VC Landscape in 2025: Who's Writing Cheques and at What Stage", meta: 'David Mutua · 9 min' },
              { num: '03', tag: '🤖 AI & ML', title: "Running LLMs on East African Edge Devices: A Practical Field Test", meta: 'Grace Njoroge · 11 min' },
            ].map((side, i) => (
              <Link href="/search" key={i} className="side-card" style={{ textDecoration: 'none' }}>
                <div className="side-num">{side.num}</div>
                <div>
                  <div className="side-tag">{side.tag}</div>
                  <div className="side-title">{side.title}</div>
                  <div className="side-meta">{side.meta}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="section white">
        <div className="sec-hdr">
          <h2 className="sec-title">Browse by <span>Category</span></h2>
          <Link href="/search" className="sec-link">All topics →</Link>
        </div>
        <div className="cats-grid">
          {[
            { name: 'Software Engineering', count: 48, icon: <><rect x="2" y="3" width="20" height="14" rx="2" /><polyline points="8 21 12 17 16 21" /></> },
            { name: 'DevOps & Cloud', count: 41, icon: <><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></> },
            { name: 'Cybersecurity', count: 31, icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
            { name: 'AI & ML', count: 27, icon: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></> },
            { name: 'Mobile Dev', count: 22, icon: <><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" /></> },
            { name: 'Fintech & M-Pesa', count: 35, icon: <><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></> },
            { name: 'Startups & VC', count: 19, icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2" /> },
            { name: 'Data Engineering', count: 18, icon: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></> }
          ].map((cat, i) => (
            <Link href={`/categories/${cat.name.split(' ')[0].toLowerCase()}`} key={i} className="cat-card" style={{ display: 'block', textDecoration: 'none' }}>
              <div className="cat-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  {cat.icon}
                </svg>
              </div>
              <div className="cat-name">{cat.name}</div>
              <div className="cat-count">{cat.count} articles</div>
            </Link>
          ))}
        </div>
      </section>

      {/* LATEST ARTICLES */}
      <section className="section">
        <div className="sec-hdr">
          <h2 className="sec-title">Latest from <span>Kenya</span></h2>
          <Link href="/search" className="sec-link">All articles →</Link>
        </div>
        <div className="arts-grid">
          <Link href="/search" className="art-main" style={{ display: 'block' }}>
            <div className="art-img">
              <div className="dots"></div><span className="feat-tag">In-Depth Guide</span>
            </div>
            <div className="art-body">
              <div className="art-tag">⚙ DevOps &amp; Cloud</div>
              <h2 className="art-title">Deploying a Zero-Downtime Kubernetes Cluster on Google Cloud from Nairobi's iHub</h2>
              <p className="art-excerpt">We walked through the entire setup live at iHub last month — from cluster
                bootstrapping to rolling updates — and documented every step for the Kenyan developer community.</p>
              <div className="art-meta">
                <div className="avatar">JM</div>
                <span>James Mwangi</span><span>·</span><span>Feb 28, 2025</span><span>·</span><span>14 min</span>
              </div>
            </div>
          </Link>
          <div className="art-sidebar">
            {[
              { tag: '🔒 Cybersecurity', title: 'Mapping the East African Threat Landscape: 2025 Mid-Year Report', meta: 'Amina Ochieng · Mar 1, 2025' },
              { tag: '💳 Fintech', title: 'M-Pesa Daraja 2.0: What Changed and How to Migrate Your Integration', meta: 'Brian Otieno · Feb 25, 2025' },
              { tag: '🤖 AI & ML', title: 'Training a Swahili NLP Model on a Budget: Tools, Tips & Pitfalls', meta: 'Grace Njoroge · Feb 20, 2025' },
              { tag: '🚀 Startups', title: "Inside Twiga Foods' Backend Rewrite: Lessons from Kenya's Largest Agri-Tech", meta: 'David Mutua · Feb 15, 2025' },
              { tag: '📱 Mobile', title: 'Flutter vs React Native in 2025: Perspectives from East African Developers', meta: 'Cynthia Wambua · Feb 10, 2025' }
            ].map((art, i) => (
              <Link href="/search" key={i} className="art-list-item" style={{ display: 'block', textDecoration: 'none' }}>
                <div className="ali-tag">{art.tag}</div>
                <div className="ali-title">{art.title}</div>
                <div className="ali-meta">{art.meta}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CODE SHOWCASE */}
      <section className="code-section">
        <div className="sec-hdr" style={{ borderColor: 'rgba(246,244,240,.12)' }}>
          <h2 className="sec-title" style={{ color: '#F6F4F0' }}>Code That <span>Ships</span></h2>
          <Link href="/search" className="sec-link" style={{ color: 'rgba(246,244,240,.4)' }}>All tutorials →</Link>
        </div>
        <div className="code-block">
          <div className="code-hdr">
            <div className="c-dots">
              <div className="cd r"></div>
              <div className="cd y"></div>
              <div className="cd g"></div>
            </div>
            <span className="c-file">mpesa_daraja.py</span>
            <CopyButton targetText="# Bash n Build Tutorial..." />
          </div>
          <div className="code-body">
            <pre>
<span className="cmt"># Bash n Build Tutorial — M-Pesa STK Push via Daraja 2.0</span>{'\n'}
<span className="kw">import</span> <span className="fn">requests</span>, base64{'\n'}
<span className="kw">from</span> datetime <span className="kw">import</span> datetime{'\n'}
{'\n'}
<span className="kw">def</span> <span className="fn">get_access_token</span>(consumer_key: str, consumer_secret: str) -&gt; str:{'\n'}
    <span className="str">"""Fetch Bearer token from Safaricom sandbox."""</span>{'\n'}
    credentials = base64.b64encode({'\n'}
        f<span className="str">"&#123;consumer_key&#125;:&#123;consumer_secret&#125;"</span>.encode(){'\n'}
    ).decode(){'\n'}
    response = requests.<span className="fn">get</span>({'\n'}
        <span className="str">"https://sandbox.safaricom.co.ke/oauth/v1/generate"</span>,{'\n'}
        headers=&#123;<span className="str">"Authorization"</span>: f<span className="str">"Basic &#123;credentials&#125;"</span>&#125;,{'\n'}
        params=&#123;<span className="str">"grant_type"</span>: <span className="str">"client_credentials"</span>&#125;{'\n'}
    ){'\n'}
    <span className="kw">return</span> response.json()[<span className="str">"access_token"</span>]{'\n'}
{'\n'}
<span className="kw">def</span> <span className="fn">stk_push</span>(phone: str, amount: int, ref: str) -&gt; dict:{'\n'}
    timestamp = datetime.now().<span className="fn">strftime</span>(<span className="str">"%Y%m%d%H%M%S"</span>){'\n'}
    <span className="cmt"># Prompt user with STK push payment dialogue</span>{'\n'}
    <span className="kw">return</span> &#123;<span className="str">"ResponseCode"</span>: <span className="str">"0"</span>, <span className="str">"CustomerMessage"</span>: <span className="str">"Success"</span>&#125;
            </pre>
          </div>
        </div>
      </section>

      {/* REGIONAL EXPANSION */}
      <section className="section white">
        <div className="sec-hdr">
          <h2 className="sec-title">Expanding <span>Pan-Africa</span></h2>
          <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>Building continent-wide, one hub at a time</span>
        </div>
        <div className="regions-grid">
          <div className="region-card kenya">
            <div className="region-pattern"></div>
            <span className="region-badge live">🟢 Live Now</span>
            <div className="region-body">
              <div className="region-flag">🇰🇪</div>
              <h3 className="region-name">Kenya Hub</h3>
              <p className="region-sub">The Silicon Savannah. Home to M-Pesa, iHub, and the continent's most active startup ecosystem. Bash n Build's home base.</p>
              <div className="region-stats">
                <div><div className="rstat-val">142</div><div className="rstat-lbl">Articles</div></div>
                <div><div className="rstat-val">8</div><div className="rstat-lbl">Categories</div></div>
                <div><div className="rstat-val">24K</div><div className="rstat-lbl">Readers</div></div>
              </div>
            </div>
          </div>
          <div className="region-card sa">
            <div className="region-pattern"></div>
            <span className="region-badge soon">Coming Soon</span>
            <div className="region-body">
              <div className="region-flag">🇿🇦</div>
              <h3 className="region-name">South Africa Hub</h3>
              <p className="region-sub">Johannesburg's Sandton tech corridor, Cape Town's startup scene, and deep enterprise IT coverage.</p>
              <div className="region-soon-label">⏳ Launching Q3 2025</div>
            </div>
          </div>
          <div className="region-card ng">
            <div className="region-pattern"></div>
            <span className="region-badge soon">Coming Soon</span>
            <div className="region-body">
              <div className="region-flag">🇳🇬</div>
              <h3 className="region-name">Nigeria Hub</h3>
              <p className="region-sub">Lagos Yaba's "Yabacon Valley", the largest fintech market in Africa, and Nigeria's booming developer community.</p>
              <div className="region-soon-label">⏳ Launching Q4 2025</div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter">
        <div className="nl-left">
          <p className="nl-eyebrow">Weekly Digest</p>
          <h2 className="nl-title">Stay plugged into Kenya's tech pulse.</h2>
          <p className="nl-sub">Every Friday, get the week's top technical guides, startup funding news, and ecosystem updates
            — straight to your inbox. No spam, ever.</p>
        </div>
        <div className="nl-right">
          <form className="nl-form" action="/subscribe">
            <input className="nl-input" type="email" placeholder="your@email.com" required />
            <button className="nl-btn" type="submit">Subscribe →</button>
          </form>
          <p className="nl-note">Join 24,000+ Kenyan tech professionals. Unsubscribe any time.</p>
        </div>
      </section>
    </div>
  );
}
