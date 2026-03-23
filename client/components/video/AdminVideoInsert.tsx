'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import './AdminVideoInsert.css';

/**
 * Regex that extracts a YouTube video ID from various URL formats:
 *   - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *   - https://youtu.be/dQw4w9WgXcQ
 *   - https://www.youtube.com/embed/dQw4w9WgXcQ
 *   - https://youtube.com/watch?v=dQw4w9WgXcQ&t=120
 *   - dQw4w9WgXcQ  (bare ID)
 */
const YT_URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})|^([a-zA-Z0-9_-]{11})$/;

function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const match = trimmed.match(YT_URL_REGEX);
  if (!match) return null;
  return match[1] || match[2] || null;
}

interface AdminVideoInsertProps {
  /**
   * Called when the user clicks "Insert".
   * Receives the [VIDEO:id:title] tag string to be placed
   * at the cursor position in the article editor.
   */
  onInsert: (tag: string) => void;
}

export default function AdminVideoInsert({ onInsert }: AdminVideoInsertProps) {
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const urlRef = useRef<HTMLInputElement>(null);

  const videoId = useMemo(() => extractVideoId(urlInput), [urlInput]);

  const canInsert = videoId !== null && titleInput.trim().length > 0;

  const handleInsert = useCallback(() => {
    if (!videoId || !titleInput.trim()) return;
    const tag = `[VIDEO:${videoId}:${titleInput.trim()}]`;
    onInsert(tag);
    // Reset fields after insertion
    setUrlInput('');
    setTitleInput('');
    urlRef.current?.focus();
  }, [videoId, titleInput, onInsert]);

  return (
    <div className="avi">
      <h3 className="avi__heading">Insert YouTube Video</h3>

      {/* URL / ID input */}
      <div className="avi__row">
        <input
          ref={urlRef}
          className="avi__input"
          type="text"
          placeholder="Paste YouTube URL or Video ID"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
      </div>

      {/* Title input */}
      <input
        className="avi__title-input"
        type="text"
        placeholder="Video title / caption"
        value={titleInput}
        onChange={(e) => setTitleInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && canInsert) handleInsert();
        }}
      />

      {/* Parsed ID badge */}
      {videoId && (
        <div className="avi__id-badge">ID: {videoId}</div>
      )}

      {/* Validation error */}
      {urlInput.trim() && !videoId && (
        <p className="avi__error">
          Could not detect a valid YouTube video ID. Paste a full URL or an 11-character ID.
        </p>
      )}

      {/* Live thumbnail preview */}
      {videoId && (
        <div className="avi__preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="avi__preview-img"
            src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
            alt="Video preview thumbnail"
          />
          <div className="avi__preview-overlay">
            <svg
              className="avi__preview-play"
              viewBox="0 0 68 68"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="34" cy="34" r="34" fill="#E8A317" />
              <polygon points="27,20 27,48 50,34" fill="#FFFFFF" />
            </svg>
          </div>
        </div>
      )}

      {/* Insert button */}
      <button
        className="avi__insert-btn"
        disabled={!canInsert}
        onClick={handleInsert}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Insert Video Tag
      </button>
    </div>
  );
}
