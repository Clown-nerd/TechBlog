'use client';

import { useState, useCallback, useEffect, use, useRef } from 'react';
import ArticleEditor from '@/components/admin/ArticleEditor';
import EditorSidebar, { ArticleFormData } from '@/components/admin/EditorSidebar';
import ArticlePreview from '@/components/admin/ArticlePreview';
import { useAutoSave } from '@/lib/useAutoSave';
import { useUnsavedChanges } from '@/lib/useUnsavedChanges';
import '@/components/admin/editor.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const INITIAL_FORM: ArticleFormData = {
  title: '',
  slug: '',
  excerpt: '',
  category_id: null,
  tag_names: [],
  cover_image_url: '',
  author_id: null,
  status: 'draft',
  reading_time_minutes: 1,
  youtube_video_id: '',
};

interface VersionRecord {
  id: string;
  body: string;
  form: ArticleFormData;
  savedAt: string;
  wordCount: number;
}

const countWords = (html: string) => {
  const text = html.replace(/<[^>]*>?/gm, ' ');
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [body, setBody] = useState('');
  const [form, setForm] = useState<ArticleFormData>(INITIAL_FORM);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Version Control State
  const [versions, setVersions] = useState<VersionRecord[]>([]);

  useUnsavedChanges(isDirty);

  const draftKey = `bnb_draft_edit_${id}`;
  const { save, clearDraft, lastSavedAt } = useAutoSave({
    key: draftKey,
    data: { body, form },
  });

  // Refs for auto-saving up-to-date state
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;
  const bodyRef = useRef(body);
  bodyRef.current = body;
  const formRef = useRef(form);
  formRef.current = form;

  // Load Initial Data & Versions
  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/categories`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/authors`).then(r => r.json()).then(d => Array.isArray(d) ? d : d.data || []).catch(() => []),
    ]).then(([cats, auths]) => {
      setCategories(cats);
      setUsers(auths);
    });

    try {
      const storedVersions = localStorage.getItem(`bnb_versions_${id}`);
      if (storedVersions) setVersions(JSON.parse(storedVersions));
    } catch {}

    setLoading(false);
  }, [id]);

  const saveToVersionHistory = useCallback((currentBody: string, currentForm: ArticleFormData) => {
    setVersions(prev => {
      if (!currentBody.trim() && !currentForm.title.trim()) return prev;
      
      const newVersion: VersionRecord = {
        id: Date.now().toString(),
        body: currentBody,
        form: currentForm,
        savedAt: new Date().toISOString(),
        wordCount: countWords(currentBody)
      };
      
      const next = [newVersion, ...prev].slice(0, 20);
      try {
        localStorage.setItem(`bnb_versions_${id}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, [id]);

  // 5 Minute Auto Save
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isDirtyRef.current) {
        saveToVersionHistory(bodyRef.current, formRef.current);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [saveToVersionHistory]);

  const handleManualSave = useCallback(() => {
    save();
    saveToVersionHistory(body, form);
  }, [save, saveToVersionHistory, body, form]);

  const restoreVersion = useCallback((version: VersionRecord) => {
    if (confirm('Are you sure you want to restore this version? Unsaved changes will be lost.')) {
      setBody(version.body);
      setForm(version.form);
      setIsDirty(true);
      alert('Version restored!');
    }
  }, []);

  const handleFormChange = useCallback((updates: Partial<ArticleFormData>) => {
    setForm(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  const handleBodyChange = useCallback((html: string) => {
    setBody(html);
    setIsDirty(true);
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!form.title || !body) {
      alert('Title and body are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          excerpt: form.excerpt || undefined,
          body,
          cover_image_url: form.cover_image_url || undefined,
          youtube_video_id: form.youtube_video_id || undefined,
          status: form.status,
          reading_time_minutes: form.reading_time_minutes,
          author_id: form.author_id,
          category_id: form.category_id,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to update article');
        return;
      }
      clearDraft();
      setIsDirty(false);
      saveToVersionHistory(body, form);
      alert('Article updated successfully!');
    } catch {
      alert('Network error — could not update.');
    } finally {
      setSaving(false);
    }
  }, [form, body, id, clearDraft, saveToVersionHistory]);

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>;
  }

  // ── Revision History panel (only shown in normal view) ────────────────────
  const revisionPanel = (
    <div style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.25rem', boxShadow: 'var(--sh-card)', height: 'fit-content', position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.62rem', letterSpacing: '0.18em', color: 'var(--gold)', textTransform: 'uppercase', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', margin: 0 }}>
        Revision History
      </h3>
      {versions.length === 0 ? (
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', padding: '1rem 0' }}>No versions saved yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '600px', overflowY: 'auto' }}>
          {versions.map((ver, idx) => {
            const olderVer = versions[idx + 1];
            const wordDiff = olderVer ? ver.wordCount - olderVer.wordCount : 0;
            const isCurrent = idx === 0;
            
            let authorInitials = 'ME';
            if (form.author_id) {
              const author = users.find(u => u.id === form.author_id);
              if (author && author.name) {
                const names = author.name.split(' ');
                authorInitials = names.length > 1 ? (names[0][0] + names[names.length - 1][0]).toUpperCase() : author.name.substring(0,2).toUpperCase();
              }
            }

            return (
              <div key={ver.id} style={{ 
                padding: '0.8rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border)', 
                borderLeft: isCurrent ? '3px solid var(--gold)' : '1px solid var(--border)',
                background: isCurrent ? 'rgba(232,163,23,0.03)' : 'transparent'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.55rem', fontWeight: 700, fontFamily: '"Fraunces", serif' }}>
                      {authorInitials}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--char)', fontFamily: '"IBM Plex Mono", monospace' }}>
                      {new Date(ver.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: wordDiff > 0 ? 'var(--green)' : wordDiff < 0 ? 'var(--terra)' : 'var(--muted)' }}>
                    {wordDiff > 0 ? `+${wordDiff}` : wordDiff < 0 ? wordDiff : '0'} words
                  </span>
                  {!isCurrent && (
                    <button onClick={() => restoreVersion(ver)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', fontFamily: '"IBM Plex Mono", monospace', transition: 'opacity 0.2s' }} onMouseOver={e => (e.currentTarget.style.opacity = '0.7')} onMouseOut={e => (e.currentTarget.style.opacity = '1')}>
                      Restore
                    </button>
                  )}
                  {isCurrent && (
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--muted)', fontFamily: '"IBM Plex Mono", monospace' }}>Current</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Header ─────────────────────────────────────────────────────────────────
  const header = (
    <div className="cms-page-hdr">
      <h1 className="cms-page-title">Edit Article</h1>
      <div className="cms-page-actions">
        <button
          id="preview-toggle-btn"
          className={`cms-btn-preview${previewOpen ? ' is-active' : ''}`}
          onClick={() => setPreviewOpen(v => !v)}
        >
          {previewOpen ? '← Edit' : 'Preview ↗'}
        </button>
        <button className="cms-btn-ghost" onClick={handleManualSave}>Save Draft</button>
        <button className="cms-btn-primary" onClick={handleUpdate} disabled={saving}>
          {saving ? 'Saving…' : 'Update Article'}
        </button>
      </div>
    </div>
  );

  if (previewOpen) {
    return (
      <div className="cms-editor-page--preview">
        <div className="cms-editor-left">
          {header}
          <ArticleEditor articleId={id} status={form.status} initialContent={body} onChange={handleBodyChange} />
          <EditorSidebar
            form={form}
            onChange={handleFormChange}
            body={body}
            categories={categories}
            users={users}
            isDirty={isDirty}
            lastSavedAt={lastSavedAt}
          />
        </div>
        <ArticlePreview
          form={form}
          body={body}
          authors={users}
          categories={categories}
        />
      </div>
    );
  }

  return (
    <div className="cms-editor-page--normal-3col">
      {header}
      <ArticleEditor articleId={id} status={form.status} initialContent={body} onChange={handleBodyChange} />
      <EditorSidebar
        form={form}
        onChange={handleFormChange}
        body={body}
        categories={categories}
        users={users}
        isDirty={isDirty}
        lastSavedAt={lastSavedAt}
      />
      {revisionPanel}
    </div>
  );
}
