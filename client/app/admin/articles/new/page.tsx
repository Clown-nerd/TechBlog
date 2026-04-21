'use client';

import { useState, useCallback, useEffect } from 'react';
import ArticleEditor from '@/components/admin/ArticleEditor';
import EditorSidebar, { ArticleFormData } from '@/components/admin/EditorSidebar';
import ArticlePreview from '@/components/admin/ArticlePreview';
import { useAutoSave } from '@/lib/useAutoSave';
import { useUnsavedChanges } from '@/lib/useUnsavedChanges';
import '@/components/admin/editor.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const AUTO_SAVE_KEY = 'bnb_draft_new_article';

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

export default function NewArticlePage() {
  const [body, setBody] = useState('');
  const [form, setForm] = useState<ArticleFormData>(INITIAL_FORM);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useUnsavedChanges(isDirty);

  const { save, hasDraft, loadDraft, clearDraft, lastSavedAt } = useAutoSave({
    key: AUTO_SAVE_KEY,
    data: { body, form },
  });

  // Fetch categories and authors (unified users)
  useEffect(() => {
    fetch(`${API}/api/categories`).then(r => r.json()).then(setCategories).catch(() => []);
    fetch(`${API}/api/authors`).then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : d.data || [])).catch(() => []);
  }, []);

  // Check for existing draft on mount
  useEffect(() => {
    if (hasDraft()) setShowDraftBanner(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restoreDraft = useCallback(() => {
    const draft = loadDraft();
    if (draft) {
      setBody(draft.body || '');
      setForm(draft.form || INITIAL_FORM);
      setIsDirty(true);
    }
    setShowDraftBanner(false);
  }, [loadDraft]);

  const discardDraft = useCallback(() => {
    clearDraft();
    setShowDraftBanner(false);
  }, [clearDraft]);

  const handleFormChange = useCallback((updates: Partial<ArticleFormData>) => {
    setForm(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  const handleBodyChange = useCallback((html: string) => {
    setBody(html);
    setIsDirty(true);
  }, []);

  const handlePublish = useCallback(async () => {
    if (!form.title || !form.slug || !body) {
      alert('Title, slug, and body are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt || undefined,
          body,
          cover_image_url: form.cover_image_url || undefined,
          youtube_video_id: form.youtube_video_id || undefined,
          status: form.status,
          reading_time_minutes: form.reading_time_minutes,
          author_id: form.author_id,
          category_id: form.category_id,
          tag_ids: [],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to save article');
        return;
      }
      clearDraft();
      setIsDirty(false);
      alert('Article saved successfully!');
    } catch {
      alert('Network error — could not save.');
    } finally {
      setSaving(false);
    }
  }, [form, body, clearDraft]);

  const header = (
    <div className="cms-page-hdr">
      <h1 className="cms-page-title">New Article</h1>
      <div className="cms-page-actions">
        <button
          id="preview-toggle-btn"
          className={`cms-btn-preview${previewOpen ? ' is-active' : ''}`}
          onClick={() => setPreviewOpen(v => !v)}
        >
          {previewOpen ? '← Edit' : 'Preview ↗'}
        </button>
        <button className="cms-btn-ghost" onClick={save}>Save Draft</button>
        <button className="cms-btn-primary" onClick={handlePublish} disabled={saving}>
          {saving ? 'Saving…' : form.status === 'published' ? 'Publish' : 'Save Draft'}
        </button>
      </div>
    </div>
  );

  const draftBanner = showDraftBanner && (
    <div className="cms-draft-banner">
      <span>📝 You have an unsaved draft from a previous session.</span>
      <div>
        <button className="cms-draft-banner__restore" onClick={restoreDraft}>Restore</button>
        <button className="cms-draft-banner__discard" onClick={discardDraft}>Discard</button>
      </div>
    </div>
  );

  if (previewOpen) {
    return (
      <div className="cms-editor-page--preview">
        <div className="cms-editor-left">
          {header}
          {draftBanner}
          <ArticleEditor initialContent={body} onChange={handleBodyChange} />
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
    <div className="cms-editor-page--normal">
      {header}
      {draftBanner}
      <ArticleEditor initialContent={body} onChange={handleBodyChange} />
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
  );
}
