'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ─── TYPES ────────────────────────────────────────────────────────────────── */
interface MediaItem {
  id: string;
  filename: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadedAt: string;
  thumbnail: string; // base64 data URI or gradient CSS
  mimeType: string;
}

/* ─── GRADIENT THUMBNAILS (dark green gradient art style) ──────────────────── */
function generateGradientSVG(seed: number): string {
  const gradients = [
    'linear-gradient(135deg, #091f12 0%, #1A4331 50%, #2a6649 100%)',
    'linear-gradient(160deg, #071a0d 0%, #1A4331 65%, #2d6244 100%)',
    'linear-gradient(145deg, #0a2618 0%, #1A4331 40%, #358256 100%)',
    'linear-gradient(120deg, #050f0a 0%, #163b2b 50%, #1A4331 100%)',
    'linear-gradient(150deg, #091a10 0%, #1A4331 65%, #2a5a3f 100%)',
    'linear-gradient(170deg, #0d2a1a 0%, #1A4331 45%, #2a6649 80%, #358256 100%)',
  ];
  return gradients[seed % gradients.length];
}

/* ─── MOCK MEDIA DATA ──────────────────────────────────────────────────────── */
const MOCK_MEDIA: MediaItem[] = [
  { id: 'media-1', filename: 'hero-silicon-savannah.webp', type: 'image', size: 245800, uploadedAt: '2026-04-05T10:24:00Z', thumbnail: '', mimeType: 'image/webp' },
  { id: 'media-2', filename: 'api-architecture-diagram.png', type: 'image', size: 189400, uploadedAt: '2026-04-04T14:12:00Z', thumbnail: '', mimeType: 'image/png' },
  { id: 'media-3', filename: 'devops-pipeline-flow.svg', type: 'image', size: 34200, uploadedAt: '2026-04-03T09:45:00Z', thumbnail: '', mimeType: 'image/svg+xml' },
  { id: 'media-4', filename: 'nairobi-tech-meetup.jpg', type: 'image', size: 412600, uploadedAt: '2026-04-02T16:30:00Z', thumbnail: '', mimeType: 'image/jpeg' },
  { id: 'media-5', filename: 'keynote-talk-highlights.mp4', type: 'video', size: 8945200, uploadedAt: '2026-04-01T11:20:00Z', thumbnail: '', mimeType: 'video/mp4' },
  { id: 'media-6', filename: 'react-hooks-cheatsheet.png', type: 'image', size: 156300, uploadedAt: '2026-03-30T08:55:00Z', thumbnail: '', mimeType: 'image/png' },
];

const STORAGE_KEY = 'bnb_media_library';

/* ─── HELPERS ──────────────────────────────────────────────────────────────── */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function generateId(): string {
  return 'media-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function getMediaType(mime: string): 'image' | 'video' | 'document' {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  return 'document';
}

/* ─── TOAST NOTIFICATION ──────────────────────────────────────────────────── */
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: visible ? 24 : -60,
      right: 24,
      background: 'var(--char)',
      color: '#F6F4F0',
      borderRadius: 8,
      padding: '.75rem 1.25rem',
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontSize: '.85rem',
      fontWeight: 500,
      boxShadow: 'var(--sh-float)',
      zIndex: 9999,
      transition: 'bottom .3s var(--ease-spring)',
      display: 'flex',
      alignItems: 'center',
      gap: '.5rem',
    }}>
      <span style={{ color: 'var(--green2)', fontSize: '1rem' }}>✓</span>
      {message}
    </div>
  );
}

/* ─── MAIN COMPONENT ──────────────────────────────────────────────────────── */
export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [sort, setSort] = useState<'newest' | 'name' | 'size'>('newest');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ name: string; size: number; progress: number } | null>(null);
  const [toast, setToast] = useState({ message: '', visible: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── LOAD FROM STORAGE ──────────────────────── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMedia(parsed);
          return;
        }
      }
    } catch {}
    // Initialize with mock data
    setMedia(MOCK_MEDIA);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_MEDIA));
  }, []);

  /* ── SAVE TO STORAGE ────────────────────────── */
  useEffect(() => {
    if (media.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(media));
    }
  }, [media]);

  /* ── TOAST HELPER ───────────────────────────── */
  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2500);
  }, []);

  /* ── FILE UPLOAD HANDLER ────────────────────── */
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const accepted = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4'];
    if (!accepted.includes(file.type)) {
      showToast('Unsupported file type');
      return;
    }

    setUploadProgress({ name: file.name, size: file.size, progress: 0 });

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        // Read file as base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const newItem: MediaItem = {
            id: generateId(),
            filename: file.name,
            type: getMediaType(file.type),
            size: file.size,
            uploadedAt: new Date().toISOString(),
            thumbnail: (e.target?.result as string) || '',
            mimeType: file.type,
          };
          setMedia(prev => [newItem, ...prev]);
          setUploadProgress(null);
          showToast(`"${file.name}" uploaded successfully`);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadProgress(prev => prev ? { ...prev, progress } : null);
      }
    }, 200);
  }, [showToast]);

  /* ── DRAG & DROP ────────────────────────────── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  /* ── DELETE ─────────────────────────────────── */
  const handleDelete = useCallback((id: string) => {
    setMedia(prev => {
      const updated = prev.filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    if (selectedId === id) setSelectedId(null);
    showToast('File deleted');
  }, [selectedId, showToast]);

  /* ── COPY URL ───────────────────────────────── */
  const handleCopyUrl = useCallback((filename: string) => {
    const url = `/uploads/${filename}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Copied!');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied!');
    });
  }, [showToast]);

  /* ── FILTER & SORT ──────────────────────────── */
  const filtered = media
    .filter(m => filter === 'all' || m.type === filter)
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      if (sort === 'name') return a.filename.localeCompare(b.filename);
      return b.size - a.size;
    });

  const filterPills: { label: string; value: typeof filter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Images', value: 'image' },
    { label: 'Videos', value: 'video' },
    { label: 'Documents', value: 'document' },
  ];

  const sortOptions: { label: string; value: typeof sort }[] = [
    { label: 'Newest', value: 'newest' },
    { label: 'Name', value: 'name' },
    { label: 'Size', value: 'size' },
  ];

  return (
    <div>
      {/* inject keyframes */}
      <style>{`
        @keyframes mediaFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .media-item {
          animation: mediaFadeIn .3s var(--ease-enter) both;
        }
        .media-item:nth-child(2) { animation-delay: .04s; }
        .media-item:nth-child(3) { animation-delay: .08s; }
        .media-item:nth-child(4) { animation-delay: .12s; }
        .media-item:nth-child(5) { animation-delay: .16s; }
        .media-item:nth-child(6) { animation-delay: .20s; }
        @keyframes progressPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .7; }
        }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.75rem',
      }}>
        <h1 style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '.85rem',
          fontWeight: 600,
          letterSpacing: '.18em',
          textTransform: 'uppercase' as const,
          color: 'var(--char)',
        }}>
          MEDIA LIBRARY
        </h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={cs.uploadBtn}
          onMouseEnter={e => { e.currentTarget.style.background = '#a83c28'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--terra)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif,.svg,.mp4"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* ── DRAG & DROP ZONE ───────────────────────────── */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploadProgress && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragOver ? 'var(--green2)' : 'var(--border)'}`,
          borderRadius: 12,
          padding: uploadProgress ? '1.25rem 1.5rem' : '2.5rem 2rem',
          textAlign: 'center' as const,
          background: isDragOver ? 'rgba(26,67,49,0.04)' : 'var(--surface)',
          cursor: uploadProgress ? 'default' : 'pointer',
          transition: 'border-color .2s, background .2s',
          marginBottom: '1.75rem',
        }}
      >
        {uploadProgress ? (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '.5rem',
            }}>
              <span style={{
                fontSize: '.85rem',
                fontWeight: 500,
                color: 'var(--char)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '60%',
              } as React.CSSProperties}>
                {uploadProgress.name}
              </span>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '.72rem',
                color: 'var(--muted)',
              }}>
                {formatFileSize(uploadProgress.size)}
              </span>
            </div>
            <div style={{
              height: 6,
              borderRadius: 3,
              background: 'var(--border)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${uploadProgress.progress}%`,
                height: '100%',
                borderRadius: 3,
                background: 'var(--green2)',
                transition: 'width .2s ease-out',
              }} />
            </div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '.65rem',
              color: 'var(--muted)',
              marginTop: '.35rem',
              textAlign: 'right' as const,
            }}>
              {Math.round(uploadProgress.progress)}%
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '.5rem', opacity: 0.35 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div style={{
              fontSize: '.9rem',
              color: 'var(--muted)',
              fontWeight: 500,
            }}>
              Drop images here or click to browse
            </div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '.65rem',
              color: 'var(--border)',
              marginTop: '.35rem',
              letterSpacing: '.06em',
              textTransform: 'uppercase' as const,
            }}>
              JPG, PNG, WebP, GIF, SVG, MP4
            </div>
          </>
        )}
      </div>

      {/* ── FILTER BAR ─────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '.75rem',
      }}>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          {filterPills.map(pill => (
            <button
              key={pill.value}
              onClick={() => setFilter(pill.value)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '.68rem',
                letterSpacing: '.08em',
                textTransform: 'uppercase' as const,
                padding: '.35rem .85rem',
                borderRadius: 20,
                border: `1.5px solid ${filter === pill.value ? 'var(--green)' : 'var(--border)'}`,
                background: filter === pill.value ? 'rgba(26,67,49,0.08)' : 'var(--surface)',
                color: filter === pill.value ? 'var(--green)' : 'var(--muted)',
                cursor: 'pointer',
                transition: 'border-color .15s, color .15s, background .15s',
                fontWeight: 500,
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '.6rem',
            letterSpacing: '.1em',
            textTransform: 'uppercase' as const,
            color: 'var(--muted)',
          }}>
            Sort:
          </span>
          {sortOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '.68rem',
                letterSpacing: '.06em',
                padding: '.3rem .65rem',
                borderRadius: 6,
                border: 'none',
                background: sort === opt.value ? 'rgba(26,67,49,0.08)' : 'transparent',
                color: sort === opt.value ? 'var(--green)' : 'var(--muted)',
                cursor: 'pointer',
                transition: 'background .15s, color .15s',
                fontWeight: sort === opt.value ? 600 : 400,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MEDIA COUNT ────────────────────────────────── */}
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '.68rem',
        color: 'var(--muted)',
        marginBottom: '1rem',
        letterSpacing: '.04em',
      }}>
        {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
      </div>

      {/* ── MEDIA GRID ─────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '1rem',
      }}>
        {filtered.map((item, i) => {
          const isSelected = selectedId === item.id;
          const isHovered = hoveredId === item.id;
          const gradient = generateGradientSVG(i);

          return (
            <div
              key={item.id}
              className="media-item"
              style={{
                borderRadius: 10,
                border: `2px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
                background: 'var(--surface)',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: isHovered ? 'var(--sh-hover)' : 'var(--sh-card)',
                transition: 'border-color .18s, box-shadow .2s, transform .2s var(--ease-spring)',
                transform: isHovered ? 'translateY(-2px)' : 'none',
              }}
              onClick={() => setSelectedId(isSelected ? null : item.id)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Thumbnail */}
              <div style={{
                height: 120,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {item.thumbnail && item.thumbnail.startsWith('data:') ? (
                  <img
                    src={item.thumbnail}
                    alt={item.filename}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px 8px 0 0',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: gradient,
                    borderRadius: '8px 8px 0 0',
                    position: 'relative',
                  }}>
                    {/* Dot pattern overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: 'radial-gradient(circle, rgba(232,163,23,.1) 1px, transparent 1px)',
                      backgroundSize: '18px 18px',
                    }} />
                    {/* Video icon for video type */}
                    {item.type === 'video' && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'rgba(0,0,0,0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#F6F4F0">
                            <polygon points="5,3 19,12 5,21" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Hover overlay */}
                {isHovered && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(28,28,30,0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '.5rem',
                    backdropFilter: 'blur(2px)',
                  }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.filename); }}
                      style={cs.overlayBtn}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      style={{ ...cs.overlayBtn, borderColor: 'rgba(200,76,49,0.5)', color: '#ff9a8a' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,76,49,0.3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '.65rem .75rem' }}>
                <div style={{
                  fontSize: '.78rem',
                  fontWeight: 500,
                  color: 'var(--char)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: '.2rem',
                } as React.CSSProperties}>
                  {item.filename}
                </div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '.65rem',
                  color: 'var(--muted)',
                }}>
                  {formatFileSize(item.size)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── EMPTY STATE ────────────────────────────────── */}
      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center' as const,
          padding: '4rem 2rem',
          color: 'var(--muted)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '.75rem', opacity: 0.35 }}>📁</div>
          <div style={{ fontSize: '.9rem', fontWeight: 500, marginBottom: '.3rem' }}>
            No media found
          </div>
          <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
            {filter !== 'all' ? 'Try changing the filter' : 'Upload some files to get started'}
          </div>
        </div>
      )}

      {/* ── TOAST ──────────────────────────────────────── */}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

/* ─── STYLES ───────────────────────────────────────────────────────────────── */
const cs = {
  uploadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    background: 'var(--terra)',
    color: '#F6F4F0',
    border: 'none',
    padding: '.55rem 1.25rem',
    borderRadius: 8,
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: '.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background .18s',
    letterSpacing: '.02em',
  } as React.CSSProperties,

  overlayBtn: {
    background: 'rgba(255,255,255,0.15)',
    border: '1.5px solid rgba(255,255,255,0.28)',
    borderRadius: 6,
    padding: '.3rem .65rem',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '.62rem',
    letterSpacing: '.06em',
    textTransform: 'uppercase' as const,
    color: '#F6F4F0',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'background .15s',
    backdropFilter: 'blur(4px)',
  } as React.CSSProperties,
};
