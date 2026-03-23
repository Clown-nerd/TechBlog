'use client';

import { useState, useCallback } from 'react';
import './ArticleYouTubeEmbed.css';

interface ArticleYouTubeEmbedProps {
  videoId: string;
  title: string;
  caption?: string;
}

/**
 * Lazy-loaded, privacy-enhanced YouTube embed.
 *
 * 1. Renders a branded thumbnail with gold play button overlay.
 * 2. On click → swaps the thumbnail for the real iframe (autoplay).
 * 3. Uses youtube-nocookie.com — never redirects to YouTube.
 */
export default function ArticleYouTubeEmbed({
  videoId,
  title,
  caption,
}: ArticleYouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false);

  const handlePlay = useCallback(() => {
    setPlaying(true);
  }, []);

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <div className="yt-embed" data-video-id={videoId}>
      <div
        className="yt-embed__wrapper"
        onClick={!playing ? handlePlay : undefined}
        role={!playing ? 'button' : undefined}
        tabIndex={!playing ? 0 : undefined}
        aria-label={!playing ? `Play video: ${title}` : undefined}
        onKeyDown={
          !playing
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePlay();
                }
              }
            : undefined
        }
      >
        {playing ? (
          <iframe
            className="yt-embed__iframe"
            src={embedUrl}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen={false}
            loading="lazy"
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="yt-embed__thumb"
              src={thumbnailUrl}
              alt={`Thumbnail for: ${title}`}
              loading="lazy"
            />
            <div className="yt-embed__overlay">
              {/* Gold play button SVG — Bash n Build brand */}
              <svg
                className="yt-embed__play"
                viewBox="0 0 68 68"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="34" cy="34" r="34" fill="#E8A317" />
                <polygon
                  points="27,20 27,48 50,34"
                  fill="#FFFFFF"
                />
              </svg>
            </div>
          </>
        )}
      </div>

      {caption && <p className="yt-embed__caption">{caption}</p>}
    </div>
  );
}
