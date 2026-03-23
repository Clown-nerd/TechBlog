'use client';

import { ArticleYouTubeEmbed } from '@/components/video';
import type { BodySegment } from '@/lib/articleBodyParser';

/**
 * Client component that renders the parsed article body.
 *
 * - `html` segments → dangerouslySetInnerHTML (already DOMPurify-sanitised on server)
 * - `video` segments → ArticleYouTubeEmbed interactive component
 *
 * This hybrid approach keeps sanitisation server-side while allowing
 * client-side interactive video embeds inline.
 */
export default function ArticleBody({ segments }: { segments: BodySegment[] }) {
  return (
    <div className="prose">
      {segments.map((seg, i) =>
        seg.type === 'video' ? (
          <ArticleYouTubeEmbed
            key={`vid-${seg.videoId}-${i}`}
            videoId={seg.videoId}
            title={seg.title}
            caption={seg.title}
          />
        ) : (
          <div
            key={`html-${i}`}
            dangerouslySetInnerHTML={{ __html: seg.content }}
          />
        ),
      )}
    </div>
  );
}
