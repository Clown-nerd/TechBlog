import ArticleYouTubeEmbed from './ArticleYouTubeEmbed';

/**
 * Regex that matches the [VIDEO:videoId:title] tag pattern used in article bodies.
 *
 * Examples:
 *   [VIDEO:dQw4w9WgXcQ:How to set up M-Pesa Daraja]
 *   [VIDEO:abc123XYZ-_:Getting started with Node.js in Nairobi]
 */
const VIDEO_TAG_REGEX = /\[VIDEO:([a-zA-Z0-9_-]{11}):([^\]]+)\]/g;

interface VideoTimestampProps {
  /** Raw article body HTML/text that may contain [VIDEO:id:title] tags */
  body: string;
}

/**
 * Parses article body text, splits on [VIDEO:id:title] tags, and
 * renders each match as an `ArticleYouTubeEmbed` component inline.
 *
 * Usage:
 *   <VideoTimestamp body={article.body} />
 */
export default function VideoTimestamp({ body }: VideoTimestampProps) {
  const parts: Array<{ type: 'text'; content: string } | { type: 'video'; videoId: string; title: string }> = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // We need a fresh regex instance per render (stateful with `g` flag)
  const regex = new RegExp(VIDEO_TAG_REGEX);

  while ((match = regex.exec(body)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: body.slice(lastIndex, match.index) });
    }

    parts.push({
      type: 'video',
      videoId: match[1],
      title: match[2],
    });

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last match
  if (lastIndex < body.length) {
    parts.push({ type: 'text', content: body.slice(lastIndex) });
  }

  return (
    <>
      {parts.map((part, i) =>
        part.type === 'video' ? (
          <ArticleYouTubeEmbed
            key={`vid-${part.videoId}-${i}`}
            videoId={part.videoId}
            title={part.title}
            caption={part.title}
          />
        ) : (
          <span
            key={`txt-${i}`}
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        ),
      )}
    </>
  );
}
