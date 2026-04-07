'use client';

import React, { useState } from 'react';

const Toggle = ({ active, onToggle, label }: { active: boolean, onToggle: () => void, label?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={onToggle}>
    <div className="theme-btn" style={{
      background: active ? 'var(--green)' : 'rgba(0,0,0,0.1)',
      borderColor: active ? 'var(--green)' : 'var(--border)',
      width: '44px', height: '22px'
    }}>
      <div className="tb-thumb" style={{
        left: active ? '24px' : '2px',
        top: '2px',
        width: '16px', height: '16px',
        background: '#fff',
        transition: 'left .2s var(--ease-spring)'
      }} />
    </div>
    {label && <span style={{ fontSize: '.85rem', fontWeight: 500, color: 'var(--char)' }}>{label}</span>}
  </div>
);

const Card = ({ title, children, terraBorder = false }: { title: string, children: React.ReactNode, terraBorder?: boolean }) => (
  <section style={{
    background: 'var(--surface)',
    border: `1px solid ${terraBorder ? 'var(--terra)' : 'var(--border)'}`,
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: 'var(--sh-card)'
  }}>
    <h2 className="t-display" style={{
      fontSize: '1.25rem',
      fontWeight: 900,
      marginBottom: '1.75rem',
      color: terraBorder ? 'var(--terra)' : 'var(--char)',
      letterSpacing: '-.01em'
    }}>
      {title}
    </h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {children}
    </div>
  </section>
);

export default function SettingsPage() {
  const [siteName, setSiteName] = useState('Bash n Build');
  const [tagline, setTagline] = useState('Kenya\'s Tech Pulse');
  const [showResendApi, setShowResendApi] = useState(false);
  const [tickerEnabled, setTickerEnabled] = useState(true);
  const [hubs, setHubs] = useState({
    kenya: { active: true, launchDate: '' },
    sa: { active: false, launchDate: '2025-06-01' },
    ng: { active: false, launchDate: '2025-08-15' }
  });

  const toggleHub = (hub: keyof typeof hubs) => {
    setHubs(prev => ({
      ...prev,
      [hub]: { ...prev[hub], active: !prev[hub].active }
    }));
  };

  return (
    <div className="admin-page" style={{ padding: '2rem 2.5rem', maxWidth: '900px' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 className="t-display" style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-.02em' }}>
          SETTINGS
        </h1>
      </header>

      {/* 1. SITE SETTINGS */}
      <Card title="SITE SETTINGS">
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Site Name</label>
            <input type="text" className="form-input" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Tagline</label>
            <input type="text" className="form-input" value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Site URL</label>
          <input type="url" className="form-input" defaultValue="https://bashnbuild.com" />
        </div>
        <div>
          <button className="btn-primary" style={{ padding: '.75rem 1.75rem' }}>Save Changes</button>
        </div>
      </Card>

      {/* 2. NEWSLETTER */}
      <Card title="NEWSLETTER">
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Resend API Key</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showResendApi ? 'text' : 'password'}
              className="form-input"
              defaultValue="re_123456789abcdefghijk"
              style={{ paddingRight: '3.5rem' }}
            />
            <button
              onClick={() => setShowResendApi(!showResendApi)}
              style={{
                position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', fontSize: '.7rem', color: 'var(--muted)',
                cursor: 'pointer', fontFamily: 'var(--t-mono)', textTransform: 'uppercase'
              }}
            >
              {showResendApi ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>From Name</label>
            <input type="text" className="form-input" defaultValue="Bash n Build" />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>From Email</label>
            <input type="email" className="form-input" defaultValue="hello@bashnbuild.com" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Welcome Email Subject Line</label>
          <input type="text" className="form-input" defaultValue="Welcome to Silicon Savannah's Premier Tech Feed" />
        </div>
        <div>
          <button className="btn-ghost" style={{ borderColor: 'var(--border)', color: 'var(--char)' }}>Send Test Email</button>
        </div>
      </Card>

      {/* 3. BREAKING NEWS */}
      <Card title="BREAKING NEWS">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '.25rem' }}>Enable breaking news ticker</div>
            <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Shows a scrolling red ticker below the navigation bar</div>
          </div>
          <Toggle active={tickerEnabled} onToggle={() => setTickerEnabled(!tickerEnabled)} />
        </div>
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', opacity: tickerEnabled ? 1 : 0.4, pointerEvents: tickerEnabled ? 'auto' : 'none' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Ticker Speed</label>
            <input type="range" min="1" max="3" defaultValue="2" style={{ width: '100%', accentColor: 'var(--terra)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.6rem', fontFamily: 'var(--t-mono)', marginTop: '.5rem', color: 'var(--muted)' }}>
              <span>SLOW</span>
              <span>MEDIUM</span>
              <span>FAST</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Max Ticker Items</label>
            <input type="number" className="form-input" defaultValue="10" />
          </div>
        </div>
      </Card>

      {/* 4. REGIONAL HUBS */}
      <Card title="REGIONAL HUBS">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {(['kenya', 'sa', 'ng'] as const).map((hubKey) => {
            const hub = hubs[hubKey];
            const names = { kenya: 'Kenya Hub', sa: 'South Africa Hub', ng: 'Nigeria Hub' };
            return (
              <div key={hubKey} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{names[hubKey]}</div>
                    {!hub.active && (
                      <span className="pill" style={{ fontSize: '.6rem', background: 'var(--cream)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                        COMING SOON
                      </span>
                    )}
                  </div>
                  {!hub.active && (
                    <div className="form-group" style={{ maxWidth: '280px', marginTop: '1rem' }}>
                      <label className="form-label" style={{ fontSize: '.75rem' }}>Projected Launch Date</label>
                      <input type="date" className="form-input" value={hub.launchDate} readOnly />
                    </div>
                  )}
                </div>
                <Toggle active={hub.active} onToggle={() => toggleHub(hubKey)} />
              </div>
            );
          })}
        </div>
      </Card>

      {/* 5. DANGER ZONE */}
      <Card title="DANGER ZONE" terraBorder={true}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '.9rem' }}>Clear all draft cache</div>
            <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Removes all locally stored drafts for all articles. Action is irreversible.</div>
          </div>
          <button className="btn-ghost" style={{ borderColor: 'var(--terra)', color: 'var(--terra)', padding: '.6rem 1.25rem', fontSize: '.8rem' }}>
            Clear Cache
          </button>
        </div>
        <div style={{ height: '1px', background: 'var(--border)', margin: '0 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '.9rem' }}>Export all subscriber data (CSV)</div>
            <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Downloads a CSV file with all active and inactive subscribers.</div>
          </div>
          <button className="btn-ghost" style={{ borderColor: 'var(--char)', color: 'var(--char)', padding: '.6rem 1.25rem', fontSize: '.8rem' }}>
            Export CSV
          </button>
        </div>
      </Card>

      <style jsx>{`
        .btn-ghost:hover {
          background: rgba(0,0,0,0.03);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
