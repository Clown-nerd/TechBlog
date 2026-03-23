'use client';

import { useState, useCallback, useEffect, use } from 'react';
import ArticleEditor from '@/components/admin/ArticleEditor';
import EditorSidebar, { ArticleFormData } from '@/components/admin/EditorSidebar';
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

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [body, setBody] = useState('');
  const [form, setForm] = useState<ArticleFormData>(INITIAL_FORM);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);

  useUnsavedChanges(isDirty);

  const draftKey = `bnb_draft_edit_${id}`;
  const { save, clearDraft, lastSavedAt } = useAutoSave({
    key: draftKey,
    data: { body, form },
  });

  // Fetch article, categories, authors on mount
  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/categories`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/authors`).then(r => r.json()).then(d => Array.isArray(d) ? d : d.data || []).catch(() => []),
    ]).then(([cats, auths]) => {
      setCategories(cats);
      setAuthors(auths);
    });

    // For the edit page we'd fetch the article by ID via a slug or ID endpoint.
    // Here we use a placeholder since the GET by ID would require a separate API endpoint.
    // In production, you'd call: GET /api/articles/:id (admin endpoint)
    setLoading(false);
  }, [id]);

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
      alert('Article updated successfully!');
    } catch {
      alert('Network error — could not update.');
    } finally {
      setSaving(false);
    }
  }, [form, body, id, clearDraft]);

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>;
  }

  return (
    <div className="cms-editor-page">
      <div className="cms-page-hdr">
        <h1 className="cms-page-title">Edit Article</h1>
        <div className="cms-page-actions">
          <button className="cms-btn-ghost" onClick={save}>Save Draft</button>
          <button className="cms-btn-primary" onClick={handleUpdate} disabled={saving}>
            {saving ? 'Saving…' : 'Update Article'}
          </button>
        </div>
      </div>

      <ArticleEditor initialContent={body} onChange={handleBodyChange} />

      <EditorSidebar
        form={form}
        onChange={handleFormChange}
        body={body}
        categories={categories}
        authors={authors}
        isDirty={isDirty}
        lastSavedAt={lastSavedAt}
      />
    </div>
  );
}
