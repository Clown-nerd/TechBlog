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
  seo_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  og_image_url?: string;
  canonical_url?: string;
  no_index?: boolean;
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
      {/* ── SEO & META ────────────────────────────────────────── */}
      <div className="cms-sidebar-card">
        <div className="cms-sidebar-card__title" style={{ fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", color: "var(--gold)" }}>
          SEO & META
        </div>

        <div className="cms-field">
          <label className="cms-label">SEO Title</label>
          <input
            className="cms-input"
            value={form.seo_title || ''}
            onChange={(e) => onChange({ seo_title: e.target.value.slice(0, 60) })}
            placeholder="Defaults to article title if empty"
          />
          <div
            className="cms-char-count"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.68rem",
              textAlign: "right",
              color: (form.seo_title?.length || 0) >= 55 ? "var(--terra)" : "inherit"
            }}
          >
            {form.seo_title?.length || 0}/60
          </div>
        </div>

        <div className="cms-field">
          <label className="cms-label">Meta Description</label>
          <textarea
            className="cms-textarea"
            value={form.meta_description || ''}
            onChange={(e) => onChange({ meta_description: e.target.value })}
            placeholder="Search snippet summary..."
            rows={3}
          />
          <div
            className="cms-char-count"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.68rem",
              textAlign: "right",
              color: (form.meta_description?.length || 0) >= 160 ? "var(--terra)" : (form.meta_description?.length || 0) >= 155 ? "var(--gold)" : (form.meta_description?.length || 0) >= 120 ? "var(--green2)" : "inherit"
            }}
          >
            {form.meta_description?.length || 0}/160
          </div>
          {/* Google Preview */}
          <div style={{ marginTop: "1rem", backgroundColor: "var(--cream)", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "0.85rem" }}>
            <div style={{ color: "var(--muted)", fontSize: "0.75rem", marginBottom: "0.2rem" }}>bashnbuild.co.ke/articles/{form.slug || "slug"}</div>
            <div style={{ color: "#1a0dab", fontSize: "1.05rem", fontFamily: "'IBM Plex Sans', sans-serif" }}>{form.seo_title || form.title || "SEO Title"}</div>
            <div style={{ color: "var(--muted)", marginTop: "0.2rem", lineHeight: "1.4" }}>{form.meta_description || "Meta description preview..."}</div>
          </div>
        </div>

        <div className="cms-field">
          <label className="cms-label">Focus Keyword</label>
          <input
            className="cms-input"
            value={form.focus_keyword || ''}
            onChange={(e) => onChange({ focus_keyword: e.target.value })}
            placeholder="e.g. Nextjs server components"
          />
          {form.focus_keyword && (() => {
            const kw = form.focus_keyword.trim().toLowerCase();
            const occurrences = kw ? (stripHtml(body).toLowerCase().split(kw).length - 1) : 0;
            const color = occurrences >= 3 && occurrences <= 8 ? "var(--green2)" : occurrences > 0 ? "var(--gold)" : "var(--terra)";
            return (
              <div style={{ marginTop: "0.3rem", fontSize: "0.75rem", color }}>
                {occurrences} occurrences found in body
              </div>
            );
          })()}
        </div>

        <div className="cms-field">
          <label className="cms-label">Open Graph Image URL</label>
          <input
            className="cms-input"
            value={form.og_image_url || ''}
            onChange={(e) => onChange({ og_image_url: e.target.value })}
            placeholder="Falls back to cover image if empty"
          />
          {(form.og_image_url || form.cover_image_url) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="cms-cover-preview"
              src={form.og_image_url || form.cover_image_url}
              alt="OG Preview thumbnail"
              style={{ marginTop: "0.5rem", borderRadius: "4px", maxHeight: "80px", objectFit: "cover" }}
            />
          )}
        </div>

        <div className="cms-field">
          <label className="cms-label">Canonical URL</label>
          <input
            className="cms-input"
            value={form.canonical_url || ''}
            onChange={(e) => onChange({ canonical_url: e.target.value })}
            placeholder="Leave empty for default"
          />
        </div>

        <div className="cms-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="no_index_toggle"
            checked={form.no_index || false}
            onChange={(e) => onChange({ no_index: e.target.checked })}
            style={{ accentColor: "var(--terra)", width: "16px", height: "16px" }}
          />
          <label htmlFor="no_index_toggle" className="cms-label" style={{ margin: 0, cursor: "pointer" }}>Exclude from search engines</label>
        </div>
      </div>
    </div>
  );
}
