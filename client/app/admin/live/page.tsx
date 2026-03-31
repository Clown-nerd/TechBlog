'use client';

import { useState, useEffect } from 'react';

// Interfaces for our types
interface BreakingStory {
  id: string;
  headline: string;
  category: string;
  active: boolean; // if pushed to ticker
  created_at: number;
}

interface LiveUpdate {
  id: string;
  timestamp: string;
  author_initials: string;
  text: string;
  created_at: number;
}

export default function LiveFeedPage() {
  // LEFT PANEL STATE
  const [breakingQueue, setBreakingQueue] = useState<BreakingStory[]>([]);
  const [newHeadline, setNewHeadline] = useState('');
  const [newCategory, setNewCategory] = useState('');

  // RIGHT PANEL STATE
  const [isLive, setIsLive] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState('');
  const [updateText, setUpdateText] = useState('');
  const [updateTimestamp, setUpdateTimestamp] = useState('');
  const [updateAuthor, setUpdateAuthor] = useState('');
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);

  // Mock categories & articles for demo
  const categories = ['Tech', 'Funding', 'Policy', 'E-Commerce', 'Crypto'];
  const publishedArticles = [
    { id: '1', title: 'Safaricom announces 5G expansion' },
    { id: '2', title: 'Nigerian fintech secures $20M Series A' },
    { id: '3', title: 'New crypto regulations in South Africa' },
  ];

  // Initialize data on mount
  useEffect(() => {
    // Left panel data
    const savedQueue = localStorage.getItem('bnb_breaking_queue');
    if (savedQueue) {
      try {
        setBreakingQueue(JSON.parse(savedQueue));
      } catch (e) {
        console.error('Failed to parse breaking queue', e);
      }
    }

    // Set initial timestamp
    const now = new Date();
    setUpdateTimestamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setUpdateAuthor('SS'); // Default Silicon Savannah Initials
  }, []);

  // Save changes to local storage when queue updates
  useEffect(() => {
    localStorage.setItem('bnb_breaking_queue', JSON.stringify(breakingQueue));
  }, [breakingQueue]);

  // Load right panel data when article changes
  useEffect(() => {
    if (selectedArticleId) {
      const savedUpdates = localStorage.getItem(`bnb_live_${selectedArticleId}`);
      if (savedUpdates) {
        try {
          // Sort newest first
          const parsed: LiveUpdate[] = JSON.parse(savedUpdates);
          parsed.sort((a, b) => b.created_at - a.created_at);
          setLiveUpdates(parsed);
        } catch (e) {
          console.error('Failed to parse live updates', e);
          setLiveUpdates([]);
        }
      } else {
        setLiveUpdates([]);
      }
    } else {
      setLiveUpdates([]);
    }
  }, [selectedArticleId]);

  // Save updates to local storage
  useEffect(() => {
    if (selectedArticleId && liveUpdates.length >= 0) {
      localStorage.setItem(`bnb_live_${selectedArticleId}`, JSON.stringify(liveUpdates));
    }
  }, [liveUpdates, selectedArticleId]);


  /* --- HANDLERS FOR LEFT PANEL --- */
  const addBreakingStory = () => {
    if (!newHeadline.trim() || !newCategory) return;
    const newStory: BreakingStory = {
      id: Date.now().toString(),
      headline: newHeadline,
      category: newCategory,
      active: false,
      created_at: Date.now()
    };
    setBreakingQueue([...breakingQueue, newStory]);
    setNewHeadline('');
    setNewCategory('');
  };

  const deleteBreakingStory = (id: string) => {
    setBreakingQueue(breakingQueue.filter(s => s.id !== id));
  };

  const pushToTicker = (id: string) => {
    setBreakingQueue(breakingQueue.map(s => {
      // Assuming only one can be active at a time? Let's say multiple can be active
      return s.id === id ? { ...s, active: true } : s;
    }));
  };

  const deactivateTicker = (id: string) => {
    setBreakingQueue(breakingQueue.map(s => {
      return s.id === id ? { ...s, active: false } : s;
    }));
  };

  const makeArticle = (id: string) => {
    // In a real flow, this would navigate to the new article page with prepopulated data
    alert(`Drafting article for story ID: ${id}`);
  };


  /* --- HANDLERS FOR RIGHT PANEL --- */
  const postUpdate = () => {
    if (!updateText.trim() || !selectedArticleId) return;

    const newUpdate: LiveUpdate = {
      id: Date.now().toString(),
      timestamp: updateTimestamp,
      author_initials: updateAuthor || 'SS',
      text: updateText,
      created_at: Date.now()
    };

    setLiveUpdates([newUpdate, ...liveUpdates]); // Add to front for newest first
    setUpdateText('');
    
    // Update timestamp to current
    const now = new Date();
    setUpdateTimestamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const deleteUpdate = (id: string) => {
    setLiveUpdates(liveUpdates.filter(u => u.id !== id));
  };

  return (
    <div className="section" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem', borderBottom: '2px solid var(--border)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2.5rem', fontWeight: 900, color: 'var(--char)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          LIVE FEED
        </h1>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)' }}>
          Silicon Savannah Breaking News Desk
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        
        {/* LEFT PANEL: Breaking News Queue */}
        <div className="cms-sidebar-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ background: 'var(--terra)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="live-dot" style={{ background: '#fff' }}></div>
            <h2 style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.85rem', color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Breaking News Queue
            </h2>
          </div>

          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {breakingQueue.map(story => (
                <div key={story.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', background: story.active ? 'rgba(200, 76, 49, 0.05)' : 'transparent' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--gold)' }}>{story.category}</div>
                    {story.active && <div style={{ fontSize: '0.65rem', color: 'var(--terra)', fontWeight: 'bold' }}>ACTIVE IN TICKER</div>}
                  </div>
                  
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.1rem', fontWeight: 600, color: 'var(--char)', marginBottom: '1rem', lineHeight: 1.3 }}>
                    {story.headline}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {story.active ? (
                      <button onClick={() => deactivateTicker(story.id)} className="btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', color: 'var(--char)', borderColor: 'var(--border)' }}>
                        Remove from Ticker
                      </button>
                    ) : (
                      <button onClick={() => pushToTicker(story.id)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: 'var(--terra)' }}>
                        Push to Ticker
                      </button>
                    )}
                    <button onClick={() => makeArticle(story.id)} className="btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', color: 'var(--green)', borderColor: 'var(--green)' }}>
                      Make Article
                    </button>
                    <button onClick={() => deleteBreakingStory(story.id)} className="btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', color: 'var(--muted)', borderColor: 'transparent', marginLeft: 'auto' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {breakingQueue.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
                  No breaking stories in queue.
                </div>
              )}
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Add New Story</div>
              <div className="cms-field">
                <input 
                  className="cms-input" 
                  placeholder="Headline..." 
                  value={newHeadline} 
                  onChange={e => setNewHeadline(e.target.value)}
                />
              </div>
              <div className="cms-field" style={{ display: 'flex', gap: '1rem' }}>
                <select className="cms-select" value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ flex: 1 }}>
                  <option value="">Select Category...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={addBreakingStory} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  Add Story
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* RIGHT PANEL: Live Blog */}
        <div className="cms-sidebar-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.85rem', color: 'var(--char)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Live Blog Setup
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {isLive && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(200, 76, 49, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                  <div className="live-dot"></div>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', color: 'var(--terra)', fontWeight: 'bold' }}>LIVE NOW</span>
                </div>
              )}
              <div className="cms-status-toggle" style={{ margin: 0 }}>
                <button className={`cms-status-toggle__opt ${!isLive ? 'is-active' : ''}`} onClick={() => setIsLive(false)} style={{ padding: '0.3rem 0.8rem' }}>OFF</button>
                <button className={`cms-status-toggle__opt ${isLive ? 'is-active' : ''}`} onClick={() => setIsLive(true)} style={{ padding: '0.3rem 0.8rem' }}>LIVE</button>
              </div>
            </div>
          </div>

          <div style={{ padding: '1.5rem' }}>
            <div className="cms-field" style={{ marginBottom: '2rem' }}>
              <label className="cms-label">Target Article</label>
              <select className="cms-select" value={selectedArticleId} onChange={e => setSelectedArticleId(e.target.value)}>
                <option value="">Choose an article to link...</option>
                {publishedArticles.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>

            {isLive ? (
              <>
                <div style={{ border: '2px dashed var(--border)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Composer</div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label className="cms-label">Timestamp</label>
                      <input className="cms-input" value={updateTimestamp} onChange={e => setUpdateTimestamp(e.target.value)} />
                    </div>
                    <div style={{ width: '80px' }}>
                      <label className="cms-label">Initials</label>
                      <input className="cms-input" value={updateAuthor} onChange={e => setUpdateAuthor(e.target.value)} maxLength={3} />
                    </div>
                  </div>
                  <div className="cms-field" style={{ marginBottom: '1rem' }}>
                    <textarea 
                      className="cms-textarea" 
                      placeholder="Write your live update..." 
                      rows={4} 
                      value={updateText}
                      onChange={e => setUpdateText(e.target.value)}
                    ></textarea>
                  </div>
                  <button onClick={postUpdate} className="btn-primary" style={{ width: '100%', padding: '0.75rem', background: 'var(--terra)' }}>
                    Post Update
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Live Feed ({liveUpdates.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {liveUpdates.map(update => (
                      <div key={update.id} style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--terra)' }}>
                        <div style={{ position: 'absolute', left: '-5px', top: '0', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--terra)' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--char)' }}>{update.timestamp}</span>
                            {update.author_initials && (
                              <span style={{ fontSize: '0.65rem', background: 'var(--border)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontFamily: "'IBM Plex Mono', monospace" }}>{update.author_initials}</span>
                            )}
                          </div>
                          <button onClick={() => deleteUpdate(update.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--char)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {update.text}
                        </div>
                      </div>
                    ))}
                    {liveUpdates.length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>No updates posted yet.</div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>No active live blog</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', maxWidth: '280px', margin: '0 auto', lineHeight: 1.5 }}>
                  Toggle LIVE mode on and select an article to start posting real-time updates to it.
                </div>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}
