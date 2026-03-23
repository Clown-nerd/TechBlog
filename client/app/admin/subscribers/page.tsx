'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Subscriber {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  topic_preferences: string[];
  subscribed_at: string;
  is_active: boolean;
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchSubs = async (p: number) => {
    setLoading(true);
    try {
      // In a real app with JWT auth, attach the token here.
      // E.g. headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      const res = await fetch(`${API}/api/subscribers?page=${p}&limit=50`);
      if (res.ok) {
        const json = await res.json();
        setSubscribers(json.data || []);
        setTotal(json.meta?.total_count || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs(page);
  }, [page]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return;
    try {
      const res = await fetch(`${API}/api/subscribers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubscribers(prev => prev.map(s => s.id === id ? { ...s, is_active: false } : s));
      } else {
        alert('Failed to delete subscriber.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const exportCSV = () => {
    if (!subscribers.length) return;
    
    // Simple CSV generation
    const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Topics', 'Subscribed At', 'Active'];
    const rows = subscribers.map(s => [
      s.id,
      s.email,
      s.first_name || '',
      s.last_name || '',
      `"${s.topic_preferences.join(', ')}"`, // quote array to avoid comma breaks
      new Date(s.subscribed_at).toISOString(),
      s.is_active ? 'Yes' : 'No'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bash_n_build_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', color: 'var(--char)' }}>
          Subscribers <span style={{ color: 'var(--muted)', fontSize: '1rem', fontWeight: 400 }}>({total})</span>
        </h1>
        <button 
          onClick={exportCSV}
          className="btn-ghost"
          style={{ padding: '.5rem 1rem', fontSize: '.85rem' }}
          disabled={loading || subscribers.length === 0}
        >
          Export CSV ⬇
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--sh-card)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(28,28,30,.03)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Email</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Topics</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Loading...</td></tr>
            ) : subscribers.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>No subscribers found.</td></tr>
            ) : (
              subscribers.map(sub => (
                <tr key={sub.id} style={{ borderBottom: '1px solid var(--border)', opacity: sub.is_active ? 1 : 0.5 }}>
                  <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--char)' }}>
                    {sub.email}
                    {!sub.is_active && <span style={{ marginLeft: 8, fontSize: '.7rem', padding: '2px 6px', background: 'var(--border)', borderRadius: 4 }}>Unsubscribed</span>}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--muted)' }}>
                    {sub.first_name || sub.last_name ? `${sub.first_name || ''} ${sub.last_name || ''}` : '—'}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--muted)', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={sub.topic_preferences.join(', ')}>
                    {sub.topic_preferences.join(', ')}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--muted)' }}>
                    {new Date(sub.subscribed_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {sub.is_active && (
                      <button 
                        onClick={() => handleDelete(sub.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--terra)', fontSize: '.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination basics */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
        <button 
          className="btn-ghost" 
          disabled={page === 1} 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          style={{ padding: '.4rem .8rem', fontSize: '.8rem' }}
        >
          ← Prev
        </button>
        <span style={{ fontSize: '.85rem', color: 'var(--muted)', alignSelf: 'center' }}>Page {page}</span>
        <button 
          className="btn-ghost" 
          disabled={subscribers.length < 50} 
          onClick={() => setPage(p => p + 1)}
          style={{ padding: '.4rem .8rem', fontSize: '.8rem' }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
