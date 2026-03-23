'use client';

import { useState, useCallback, useEffect, KeyboardEvent } from 'react';
import { generateSlug, calculateReadingTime, stripHtml } from '@/lib/editorUtils';

// ── Types ──────────────────────────────────────────────────────────────────
interface Category { id: number; name: string; slug: string; }
interface Author   { id: number; name: string; handle: string; }

export interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  category_id: number | null;
  tag_names: string[];
  cover_image_url: string;
  author_id: number | null;
  status: 'draft' | 'published';
  reading_time_minutes: number;
  youtube_video_id: string;
}

interface EditorSidebarProps {
  form: ArticleFormData;
  onChange: (updates: Partial<ArticleFormData>) => void;
  body: string; // article HTML for word count
  categories: Category[];
  authors: Author[];
  isDirty: boolean;
  lastSavedAt: Date | null;
}

export default function EditorSidebar({
  form, onChange, body, categories, authors, isDirty, lastSavedAt,
}: EditorSidebarProps) {
  const [tagInput, setTagInput] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  // Auto-generate slug from title (unless manually edited)
  useEffect(() => {
    if (!slugEdited && form.title) {
      onChange({ slug: generateSlug(form.title) });
    }
  }, [form.title, slugEdited]);

  // Auto-calculate reading time from body
  useEffect(() => {
    const plain = stripHtml(body);
    onChange({ reading_time_minutes: calculateReadingTime(plain) });
  }, [body]);

  // Tag input handler
  const handleTagKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (!form.tag_names.includes(tag)) {
        onChange({ tag_names: [...form.tag_names, tag] });
      }
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && form.tag_names.length) {
      onChange({ tag_names: form.tag_names.slice(0, -1) });
    }
  }, [tagInput, form.tag_names, onChange]);

  const removeTag = useCallback((tag: string) => {
    onChange({ tag_names: form.tag_names.filter(t => t !== tag) });
  }, [form.tag_names, onChange]);

  const excerptLen = form.excerpt.length;

  return (
    <div className="cms-sidebar">
      {/* ── Auto-save status ──────────────────────────────────── */}
      <div className="cms-autosave">
        <span className={`cms-autosave__dot ${isDirty ? 'is-dirty' : ''}`} />
        {lastSavedAt
          ? <>Draft saved {lastSavedAt.toLocaleTimeString()}</>
          : isDirty ? <>Unsaved changes</> : <>No changes</>
        }
      </div>

      {/* ── Article Details ───────────────────────────────────── */}
      <div className="cms-sidebar-card">
        <div className="cms-sidebar-card__title">Article Details</div>

        <div className="cms-field">
          <label className="cms-label">Title</label>
          <input
            className="cms-input"
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Article title"
          />
        </div>

        <div className="cms-field">
          <label className="cms-label">Slug</label>
          <input
            className="cms-input"
            value={form.slug}
            onChange={(e) => { setSlugEdited(true); onChange({ slug: e.target.value }); }}
            placeholder="article-slug"
          />
        </div>

        <div className="cms-field">
          <label className="cms-label">Excerpt</label>
          <textarea
            className="cms-textarea"
            value={form.excerpt}
            onChange={(e) => onChange({ excerpt: e.target.value.slice(0, 250) })}
            placeholder="Short summary (max 200 chars)"
            rows={3}
          />
          <div className={`cms-char-count ${excerptLen > 200 ? 'is-over' : ''}`}>
            {excerptLen}/200
          </div>
        </div>
      </div>

      {/* ── Taxonomy ──────────────────────────────────────────── */}
      <div className="cms-sidebar-card">
        <div className="cms-sidebar-card__title">Taxonomy</div>

        <div className="cms-field">
          <label className="cms-label">Category</label>
          <select
            className="cms-select"
            value={form.category_id ?? ''}
            onChange={(e) => onChange({ category_id: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">Select category…</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="cms-field">
          <label className="cms-label">Tags</label>
          <div className="cms-tags-wrap">
            {form.tag_names.map(tag => (
              <span key={tag} className="cms-tag-chip">
                {tag}
                <span className="cms-tag-chip__x" onClick={() => removeTag(tag)}>×</span>
              </span>
            ))}
            <input
              className="cms-tag-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add tag…"
            />
          </div>
        </div>

        <div className="cms-field">
          <label className="cms-label">Author</label>
          <select
            className="cms-select"
            value={form.author_id ?? ''}
            onChange={(e) => onChange({ author_id: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">Select author…</option>
            {authors.map(a => (
              <option key={a.id} value={a.id}>{a.name} (@{a.handle})</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Media ─────────────────────────────────────────────── */}
      <div className="cms-sidebar-card">
        <div className="cms-sidebar-card__title">Media</div>

        <div className="cms-field">
          <label className="cms-label">Cover Image URL</label>
          <input
            className="cms-input"
            value={form.cover_image_url}
            onChange={(e) => onChange({ cover_image_url: e.target.value })}
            placeholder="https://..."
          />
          {form.cover_image_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className="cms-cover-preview"
              src={form.cover_image_url}
              alt="Cover preview"
            />
          )}
        </div>

        <div className="cms-field">
          <label className="cms-label">YouTube Featured Video (optional)</label>
          <input
            className="cms-input"
            value={form.youtube_video_id}
            onChange={(e) => onChange({ youtube_video_id: e.target.value })}
            placeholder="Video ID (e.g. dQw4w9WgXcQ)"
          />
        </div>
      </div>

      {/* ── Publishing ────────────────────────────────────────── */}
      <div className="cms-sidebar-card">
        <div className="cms-sidebar-card__title">Publishing</div>

        <div className="cms-field">
          <label className="cms-label">Status</label>
          <div className="cms-status-toggle">
            <button
              className={`cms-status-toggle__opt ${form.status === 'draft' ? 'is-active' : ''}`}
              onClick={() => onChange({ status: 'draft' })}
            >Draft</button>
            <button
              className={`cms-status-toggle__opt ${form.status === 'published' ? 'is-active' : ''}`}
              onClick={() => onChange({ status: 'published' })}
            >Published</button>
          </div>
        </div>

        <div className="cms-meta-row" style={{ marginTop: '.5rem' }}>
          Reading time: <span className="cms-meta-row__val">{form.reading_time_minutes} min</span>
        </div>
      </div>
    </div>
  );
}
