'use client';

import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Contributor';
  articlesWritten: number;
  lastActive: string;
}

const mockUsers: User[] = [
  { id: 1, name: 'James Mwangi', email: 'james.mwangi@bashnbuild.com', role: 'Editor', articlesWritten: 24, lastActive: '2025-03-31T08:00:00Z' },
  { id: 2, name: 'Amina Ochieng', email: 'amina.o@bashnbuild.com', role: 'Editor', articlesWritten: 18, lastActive: '2025-03-30T15:30:00Z' },
  { id: 3, name: 'Brian Otieno', email: 'brian.otieno@gmail.com', role: 'Contributor', articlesWritten: 12, lastActive: '2025-03-28T10:15:00Z' },
  { id: 4, name: 'Grace Njoroge', email: 'grace.n@bashnbuild.com', role: 'Admin', articlesWritten: 45, lastActive: '2025-03-31T20:45:00Z' },
  { id: 5, name: 'David Mutua', email: 'david.m@bashnbuild.com', role: 'Contributor', articlesWritten: 5, lastActive: '2025-03-25T14:20:00Z' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsInviteModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRolePillStyles = (role: string) => {
    switch (role) {
      case 'Editor': return { background: 'rgba(26,67,49,.1)', color: 'var(--green)' };
      case 'Contributor': return { background: 'rgba(232,163,23,.1)', color: 'var(--gold)' };
      case 'Admin': return { background: 'rgba(200,76,49,.1)', color: 'var(--terra)' };
      default: return {};
    }
  };

  return (
    <div className="admin-page" style={{ padding: '2rem 2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h1 className="t-display" style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-.02em', margin: 0 }}>
          USERS
        </h1>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="btn-primary"
          style={{ background: 'var(--terra)', padding: '.75rem 1.5rem', fontWeight: 600, fontSize: '.9rem' }}
        >
          Invite Editor
        </button>
      </header>

      <div style={{ background: 'var(--surface)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--sh-card)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--cream)', borderBottom: '1.5px solid var(--border)' }}>
              <th style={{ padding: '1rem 1.5rem', fontSize: '.7rem', fontFamily: 'var(--t-mono)', color: 'var(--muted)', textTransform: 'uppercase' }}>User</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '.7rem', fontFamily: 'var(--t-mono)', color: 'var(--muted)', textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '.7rem', fontFamily: 'var(--t-mono)', color: 'var(--muted)', textTransform: 'uppercase' }}>Articles</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '.7rem', fontFamily: 'var(--t-mono)', color: 'var(--muted)', textTransform: 'uppercase' }}>Last Active</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '.7rem', fontFamily: 'var(--t-mono)', color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'var(--green)', color: '#F6F4F0',
                      display: 'flex', alignItems: 'center', justifyCenter: 'center',
                      fontWeight: 700, fontSize: '.8rem', flexShrink: 0,
                      justifyContent: 'center'
                    }}>
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{user.name}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span className="pill" style={getRolePillStyles(user.role)}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '.9rem', fontWeight: 500 }}>
                  {user.articlesWritten}
                </td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '.75rem', color: 'var(--muted)' }}>
                  {new Date(user.lastActive).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
                    <select
                      value={user.role}
                      onChange={(e) => {
                        const newRole = e.target.value as User['role'];
                        setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                      }}
                      className="form-input"
                      style={{ padding: '.4rem .6rem', fontSize: '.75rem', width: 'auto' }}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Editor">Editor</option>
                      <option value="Contributor">Contributor</option>
                    </select>
                    <button
                      className="btn-ghost"
                      style={{ padding: '.4rem .8rem', fontSize: '.75rem', color: 'var(--terra)', borderColor: 'var(--terra)' }}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isInviteModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--surface)', borderRadius: '20px', padding: '2.5rem',
            width: '100%', maxWidth: '420px', boxShadow: 'var(--sh-float)',
            position: 'relative'
          }}>
            <h2 className="t-display" style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1.5rem' }}>Invite Editor</h2>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
              <input type="email" className="form-input" placeholder="editor@bashnbuild.com" />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Role</label>
              <select className="form-input" defaultValue="Editor">
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Contributor">Contributor</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn-primary"
                style={{ flex: 1, padding: '.9rem' }}
                onClick={() => setIsInviteModalOpen(false)}
              >
                Send Invite
              </button>
              <button
                className="btn-ghost"
                style={{ flex: 1, padding: '.9rem', borderColor: 'var(--border)', color: 'var(--muted)' }}
                onClick={() => setIsInviteModalOpen(false)}
              >
                Cancel
              </button>
            </div>

            <button
              onClick={() => setIsInviteModalOpen(false)}
              style={{
                position: 'absolute', top: '1.5rem', right: '1.5rem',
                background: 'none', border: 'none', fontSize: '1.2rem',
                cursor: 'pointer', color: 'var(--muted)'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        th { font-weight: normal; }
        .btn-ghost:hover {
          background: rgba(0,0,0,0.03);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
