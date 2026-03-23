'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const TOPICS = [
  'DevOps & Cloud',
  'AI & ML',
  'Cybersecurity',
  'Fintech & M-Pesa',
  'Startups & VC',
  'Mobile Dev',
  'Data Engineering',
];

export default function SubscribePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [topics, setTopics] = useState<string[]>(['DevOps & Cloud', 'AI & ML']); // Defaults
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleTopicToggle = (topic: string) => {
    if (topic === 'All topics') {
      const allSelected = topics.length === TOPICS.length;
      setTopics(allSelected ? [] : [...TOPICS]);
      return;
    }
    
    setTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/api/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          first_name: firstName || undefined,
          last_name: lastName || undefined,
          topic_preferences: topics,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // "You are already subscribed!" from our backend or Zod error
        setError(data.error || 'Failed to subscribe. Please try again.');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscribe-pg">
      <div className="subscribe-box">
        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h1 className="sub-title" style={{ color: 'var(--green)' }}>You're in!</h1>
            <p className="sub-sub" style={{ marginTop: '1rem', color: 'var(--char)' }}>
              Check your inbox for a welcome email from the Silicon Savannah.
            </p>
            <button 
              className="btn-ghost" 
              style={{ marginTop: '2rem' }}
              onClick={() => { setSuccess(false); setEmail(''); }}
            >
              Back to Subscribe
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="sub-eyebrow">Weekly Digest</div>
            <h1 className="sub-title">Join the Silicon Savannah.</h1>
            <p className="sub-sub">
              24,000+ developers, engineers, and founders get Bash n Build's weekly digest — top technical
              guides, startup funding updates, and ecosystem news, every Friday.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Amina"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ochieng"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="you@company.co.ke"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '.65rem' }}>Topics I care about</label>
              <div className="topics-grid">
                {TOPICS.map(topic => (
                  <label key={topic} className="topic-check" style={{ cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={topics.includes(topic)}
                      onChange={() => handleTopicToggle(topic)}
                    /> 
                    {topic}
                  </label>
                ))}
                <label className="topic-check" style={{ cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={topics.length === TOPICS.length}
                    onChange={() => handleTopicToggle('All topics')}
                  /> 
                  All topics
                </label>
              </div>
            </div>

            {error && (
              <div style={{ color: 'var(--terra)', fontSize: '.85rem', marginBottom: '1rem', fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary sub-btn"
              disabled={loading}
              style={loading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
            >
              {loading ? 'Subscribing...' : 'Subscribe for Free →'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '.9rem', fontSize: '.72rem', color: 'var(--muted)' }}>
              No spam, ever. Unsubscribe at any time.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
