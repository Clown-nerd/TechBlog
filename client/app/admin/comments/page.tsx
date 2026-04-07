'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Comment {
  id: number;
  articleTitle: string;
  articleSlug: string;
  articleId: string;
  author: string;
  date: string;
  status: 'approved' | 'pending' | 'spam';
  text: string;
}

const mockComments: Comment[] = [
  {
    id: 1,
    articleTitle: 'Building Scalable M-Pesa Daraja 2.0 Integrations',
    articleSlug: 'mpesa-daraja-2-fastapi',
    articleId: '1',
    author: 'Kelvin Kamau',
    date: '2025-03-25T14:20:00Z',
    status: 'pending',
    text: 'This was incredibly helpful! I was struggling with the STK Push callback validation. Could you elaborate on how to handle the result codes securely? Also, what are the best practices for logging these transactions without exposing sensitive customer data?',
  },
  {
    id: 2,
    articleTitle: 'Kenya Data Protection Act: A Developer Compliance Checklist',
    articleSlug: 'kenya-dpa-developer-checklist',
    articleId: '2',
    author: 'Sarah Wandia',
    date: '2025-03-24T09:15:00Z',
    status: 'approved',
    text: 'Essential read for anyone building SaaS in Kenya. The ODPC registration process is still a bit opaque but this guide clears up the technical requirements.',
  },
  {
    id: 3,
    articleTitle: 'GitHub Copilot vs Cursor vs Local LLMs',
    articleSlug: 'ai-coding-tools-africa-comparison',
    articleId: '5',
    author: 'Anonymous Bot',
    date: '2025-03-23T22:00:00Z',
    status: 'spam',
    text: 'Get cheap followers and likes at www.social-growth-scam.com! Best prices in Nairobi! Fast delivery and no password required. 100% safe and secure.',
  },
  {
    id: 4,
    articleTitle: 'The Nairobi VC Landscape 2025',
    articleSlug: 'nairobi-vc-landscape-2025',
    articleId: '3',
    author: 'David Mutua',
    date: '2025-03-22T11:45:00Z',
    status: 'approved',
    text: 'Great overview. I\'d love to see more data on the average time to close a seed round in the current market. Keep up the good work!',
  },
  {
    id: 5,
    articleTitle: 'Building Scalable M-Pesa Daraja 2.0 Integrations',
    articleSlug: 'mpesa-daraja-2-fastapi',
    articleId: '1',
    author: 'Tech Enthusiast',
    date: '2025-03-21T18:30:00Z',
    status: 'pending',
    text: 'Does Daraja 2.0 support real-time settlement for B2C payouts yet, or is there still a batching delay? I am planning a platform that requires instant disbursements.',
  },
  {
    id: 6,
    articleTitle: 'Kenya Data Protection Act: A Developer Compliance Checklist',
    articleSlug: 'kenya-dpa-developer-checklist',
    articleId: '2',
    author: 'Legal Dev',
    date: '2025-03-20T13:10:00Z',
    status: 'approved',
    text: 'Don\'t forget about the data localization requirements for certain financial entities. That\'s a major hurdle for AWS/GCP deployments in this region.',
  },
  {
    id: 7,
    articleTitle: 'GitHub Copilot vs Cursor vs Local LLMs',
    articleSlug: 'ai-coding-tools-africa-comparison',
    articleId: '5',
    author: 'Crypto Spammer',
    date: '2025-03-19T10:05:00Z',
    status: 'spam',
    text: 'Buy Bitcoin now! High returns guaranteed!!! Double your investment in 24 hours. DM for details or visit our site.',
  },
  {
    id: 8,
    articleTitle: 'The Nairobi VC Landscape 2025',
    articleSlug: 'nairobi-vc-landscape-2025',
    articleId: '3',
    author: 'Alice Wambui',
    date: '2025-03-18T16:50:00Z',
    status: 'pending',
    text: 'Is there a list of VCs specifically focused on Agritech in the East African region? I have a startup that is at the MVP stage and looking for seed funding.',
  },
];

export default function CommentsPage() {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Spam'>('All');
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredComments = mockComments.filter(c => {
    if (filter === 'All') return true;
    return c.status === filter.toLowerCase();
  });

  return (
    <div className="admin-page" style={{ padding: '2rem 2.5rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 className="t-display" style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-.02em' }}>
          COMMENTS
        </h1>

        <div className="feed-filters" style={{ display: 'flex', gap: '.6rem' }}>
          {['All', 'Pending', 'Approved', 'Spam'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`filter-pill ${filter === tab ? 'active' : ''}`}
              style={{
                fontFamily: 'var(--t-mono)',
                fontSize: '.7rem',
                textTransform: 'uppercase',
                letterSpacing: '.1em',
                padding: '.5rem 1.2rem',
                border: '1.5px solid var(--border)',
                borderRadius: '20px',
                background: filter === tab ? 'rgba(26, 67, 49, 0.08)' : 'var(--surface)',
                color: filter === tab ? 'var(--green)' : 'var(--muted)',
                borderColor: filter === tab ? 'var(--green)' : 'var(--border)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="feed-item"
              style={{
                display: 'block', // Override default grid
                padding: '1.25rem',
                borderLeft: comment.status === 'approved'
                  ? '4px solid var(--green)'
                  : comment.status === 'pending'
                  ? '4px solid var(--gold)'
                  : '1px solid var(--border)',
                opacity: comment.status === 'spam' ? 0.5 : 1,
                cursor: 'default'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.8rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                  <Link href={`/admin/articles/${comment.articleId}/edit`} className="t-mono" style={{ fontSize: '.7rem', color: 'var(--terra)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {comment.articleTitle}
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', fontSize: '.85rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--char)' }}>{comment.author}</span>
                    <span style={{ color: 'var(--muted)', fontSize: '.75rem' }}>{new Date(comment.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <span className="pill" style={{
                  background: comment.status === 'approved' ? 'rgba(26,67,49,.1)' : comment.status === 'gold' ? 'rgba(232,163,23,.1)' : 'rgba(200,76,49,.1)',
                  color: comment.status === 'approved' ? 'var(--green)' : comment.status === 'pending' ? 'var(--gold)' : 'var(--terra)',
                  fontSize: '.6rem',
                  fontWeight: 700
                }}>
                  {comment.status.toUpperCase()}
                </span>
              </div>

              <div
                onClick={() => toggleExpand(comment.id)}
                style={{
                  fontSize: '.92rem',
                  lineHeight: '1.6',
                  color: 'var(--char)',
                  marginBottom: '1.2rem',
                  cursor: 'pointer',
                  display: expandedIds.includes(comment.id) ? 'block' : '-webkit-box',
                  WebkitLineClamp: expandedIds.includes(comment.id) ? 'unset' : 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {comment.text}
              </div>

              <div style={{ display: 'flex', gap: '.75rem' }}>
                {comment.status !== 'approved' && (
                  <button className="btn-primary" style={{ background: 'var(--green)', padding: '.4rem 1rem', fontSize: '.75rem', borderRadius: '6px' }}>
                    Approve
                  </button>
                )}
                {comment.status !== 'spam' && (
                  <button className="btn-ghost" style={{ borderColor: 'var(--muted)', color: 'var(--muted)', padding: '.4rem 1rem', fontSize: '.75rem', borderRadius: '6px' }}>
                    Spam
                  </button>
                )}
                <button className="btn-ghost" style={{ borderColor: 'var(--terra)', color: 'var(--terra)', padding: '.4rem 1rem', fontSize: '.75rem', borderRadius: '6px' }}>
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }}>💬</div>
            <p className="t-display" style={{ fontSize: '1.2rem', fontWeight: 600 }}>No comments yet</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .btn-ghost:hover {
          background: rgba(0,0,0,0.03);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
