'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useCallback, useMemo, useEffect } from 'react';

// ── YouTube URL → ID extractor (shared with AdminVideoInsert) ──────────────
const YT_URL_RE =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})|^([a-zA-Z0-9_-]{11})$/;

function extractVideoId(input: string): string | null {
  const m = input.trim().match(YT_URL_RE);
  return m ? (m[1] || m[2] || null) : null;
}

// ── Toolbar icon SVGs ──────────────────────────────────────────────────────
const Icon = ({ d, ...props }: { d: string } & React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d={d} />
  </svg>
);

// ── Props ──────────────────────────────────────────────────────────────────
interface ArticleEditorProps {
  initialContent?: string;
  onChange: (html: string) => void;
}

export default function ArticleEditor({ initialContent = '', onChange }: ArticleEditorProps) {
  const [ytOpen, setYtOpen] = useState(false);
  const [ytUrl, setYtUrl] = useState('');
  const [ytTitle, setYtTitle] = useState('');
  const [imgOpen, setImgOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: 'art-code-body' } },
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: 'Start writing your article…' }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: { class: 'prose' },
    },
  });

  // Sync initial content when editing an existing article
  useEffect(() => {
    if (editor && initialContent && !editor.getHTML().trim()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  // ── YouTube insert ────────────────────────────────────────────────────
  const ytVideoId = useMemo(() => extractVideoId(ytUrl), [ytUrl]);
  const canInsertYt = !!ytVideoId && ytTitle.trim().length > 0;

  const handleYtInsert = useCallback(() => {
    if (!editor || !ytVideoId || !ytTitle.trim()) return;
    const tag = `[VIDEO:${ytVideoId}:${ytTitle.trim()}]`;
    editor.chain().focus().insertContent(`<p>${tag}</p>`).run();
    setYtUrl('');
    setYtTitle('');
    setYtOpen(false);
  }, [editor, ytVideoId, ytTitle]);

  // ── Image insert ──────────────────────────────────────────────────────
  const handleImageInsert = useCallback(() => {
    if (!editor || !imgUrl.trim()) return;
    editor.chain().focus().setImage({ src: imgUrl.trim() }).run();
    setImgUrl('');
    setImgOpen(false);
  }, [editor, imgUrl]);

  if (!editor) return null;

  return (
    <div className="cms-editor-pane">
      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="cms-toolbar">
        {/* Headings */}
        <button
          className={`cms-toolbar__btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >H1</button>
        <button
          className={`cms-toolbar__btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >H2</button>
        <button
          className={`cms-toolbar__btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >H3</button>

        <div className="cms-toolbar__sep" />

        {/* Bold */}
        <button
          className={`cms-toolbar__btn ${editor.isActive('bold') ? 'is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        ><strong>B</strong></button>

        {/* Italic */}
        <button
          className={`cms-toolbar__btn ${editor.isActive('italic') ? 'is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        ><em>I</em></button>

        {/* Inline code */}
        <button
          className={`cms-toolbar__btn ${editor.isActive('code') ? 'is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code"
        >&lt;/&gt;</button>

        <div className="cms-toolbar__sep" />

        {/* Bullet list */}
        <button
          className={`cms-toolbar__btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </button>

        {/* Blockquote */}
        <button
          className={`cms-toolbar__btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/></svg>
        </button>

        {/* Code block */}
        <button
          className={`cms-toolbar__btn ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        >
          <Icon d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
        </button>

        {/* Horizontal rule */}
        <button
          className="cms-toolbar__btn"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >—</button>

        <div className="cms-toolbar__sep" />

        {/* Image */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            className={`cms-toolbar__btn ${imgOpen ? 'is-active' : ''}`}
            onClick={() => { setImgOpen(!imgOpen); setYtOpen(false); }}
            title="Insert Image"
          >
            <Icon d="M21 15V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10m18 0l-4-4m4 4H3m0 0l4-4m-4 4v4a2 2 0 002 2h14a2 2 0 002-2v-4" />
          </button>
          {imgOpen && (
            <div className="cms-yt-popover__panel">
              <div className="cms-yt-popover__title">Insert Image</div>
              <div className="cms-yt-popover__row">
                <input
                  className="cms-yt-popover__input"
                  placeholder="Image URL"
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleImageInsert(); }}
                  autoFocus
                />
                <button
                  className="cms-yt-popover__insert"
                  disabled={!imgUrl.trim()}
                  onClick={handleImageInsert}
                >Insert</button>
              </div>
            </div>
          )}
        </div>

        {/* YouTube */}
        <div className="cms-yt-popover">
          <button
            className={`cms-toolbar__btn ${ytOpen ? 'is-active' : ''}`}
            onClick={() => { setYtOpen(!ytOpen); setImgOpen(false); }}
            title="Insert YouTube Video"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </button>
          {ytOpen && (
            <div className="cms-yt-popover__panel">
              <div className="cms-yt-popover__title">Insert YouTube Video</div>
              <div className="cms-yt-popover__row">
                <input
                  className="cms-yt-popover__input"
                  placeholder="Paste YouTube URL or ID"
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="cms-yt-popover__row">
                <input
                  className="cms-yt-popover__input"
                  placeholder="Video title / caption"
                  value={ytTitle}
                  onChange={(e) => setYtTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && canInsertYt) handleYtInsert(); }}
                />
                <button
                  className="cms-yt-popover__insert"
                  disabled={!canInsertYt}
                  onClick={handleYtInsert}
                >Insert</button>
              </div>
              {ytVideoId && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  className="cms-yt-popover__preview"
                  src={`https://i.ytimg.com/vi/${ytVideoId}/mqdefault.jpg`}
                  alt="Video preview"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Editor body ──────────────────────────────────────────── */}
      <div className="cms-tiptap-wrap">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
