export default function AboutPage() {
  return (
    <div className="page active" id="page-about">
      <div className="about-hero">
        <div className="about-hero-inner">
          <h1 className="about-h1">Built in Nairobi,<br /><em>For All of Africa.</em></h1>
          <p className="about-sub">Bash n Build is the technical publication for the Silicon Savannah — real guides, real
            code, real stories from engineers building Africa's digital future.</p>
        </div>
      </div>
      <div className="stat-band">
        <div className="stat-band-inner">
          <div>
            <div className="stat-val">142</div>
            <div className="stat-lbl">Published articles</div>
          </div>
          <div>
            <div className="stat-val">24K</div>
            <div className="stat-lbl">Monthly readers</div>
          </div>
          <div>
            <div className="stat-val">48</div>
            <div className="stat-lbl">Contributing authors</div>
          </div>
          <div>
            <div className="stat-val">8</div>
            <div className="stat-lbl">Technical categories</div>
          </div>
        </div>
      </div>
      <div className="about-body">
        <div className="two-col">
          <div>
            <h2 className="about-h2">Our Mission</h2>
            <p className="about-p">The Silicon Savannah is home to world-class engineers — yet the technical knowledge they
              produce rarely surfaces in the platforms that developers around the world rely on. Bash n Build exists to
              fix that.</p>
            <p className="about-p">We publish deep technical guides, architecture breakdowns, and ecosystem intelligence
              written specifically for the African context: real bandwidth constraints, M-Pesa integrations, East African
              cloud latency, and the Nairobi startup landscape.</p>
            <p className="about-p">We're proudly independent, Nairobi-based, and building toward a Pan-African platform that
              covers Kenya, Nigeria, South Africa, and beyond.</p>
          </div>
          <div>
            <h2 className="about-h2">What We Stand For</h2>
            <ul className="value-list">
              <li><strong>Technical depth first</strong> — No fluff. Every article teaches you something you can apply in
                your codebase today.</li>
              <li><strong>African context always</strong> — M-Pesa, bandwidth, regional infrastructure, local startup
                ecosystem. We write for here.</li>
              <li><strong>Community-built</strong> — Our best content comes from engineers in the community. We amplify
                your expertise.</li>
              <li><strong>Open &amp; accessible</strong> — Free to read, forever. No paywalls, no tracking walls.</li>
              <li><strong>Honest &amp; independent</strong> — Our editorial stance is never influenced by advertisers or
                investors.</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="sec-hdr" style={{ padding: '0 3.5rem 1.5rem', borderBottom: '2px solid var(--char)' }}>
        <h2 className="sec-title">The <span>Team</span></h2>
      </div>
      <div className="team-grid">
        {[
          { name: 'Daniel Mose', role: 'Editor in Chief', initials: 'DM', bg: 'linear-gradient(135deg,#091a10,var(--green))', bio: 'Former Engineering Lead at Safaricom. James oversees editorial direction and technical accuracy across all categories.' },
          { name: 'Elphas Obado', role: 'Security Editor', initials: 'EO', bg: 'linear-gradient(135deg,#1a0e00,#3d1f00)', bio: 'Security researcher and OSCP-certified pentester. Amina leads all cybersecurity and privacy coverage for East Africa.' },
          { name: 'Nickson Nyagol', role: 'AI & ML Lead', initials: 'NN', bg: 'linear-gradient(135deg,#0a0a1a,#16213e)', bio: 'ML engineer and researcher focused on African-language NLP. Grace heads the AI & ML editorial vertical and writes the best-read articles on the platform.' },
          { name: 'Reinhard Carlton', role: 'Startups Editor', initials: 'RC', bg: 'linear-gradient(135deg,#1a1500,#3a2e00)', bio: 'Early-stage investor and former CTO of two Nairobi startups. Reinhard covers VC, product, and the business side of Kenya\'s tech ecosystem.' }
        ].map((member, i) => (
          <div key={i} className="team-card">
            <div className="team-img" style={{ background: member.bg }}>
              <div className="team-ava">{member.initials}</div>
            </div>
            <div className="team-body">
              <div className="team-name">{member.name}</div>
              <div className="team-role">{member.role}</div>
              <p className="team-bio">{member.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
