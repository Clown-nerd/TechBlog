/**
 * Article body parser.
 *
 * Splits the article HTML on [VIDEO:id:title] markers and returns
 * an ordered list of segments — either sanitised HTML or video
 * embed descriptors.
 *
 * Sanitisation runs on EACH HTML segment individually so that the
 * [VIDEO:…] tags themselves are never passed through DOMPurify
 * (which would strip them).
 */

import DOMPurify from 'isomorphic-dompurify';

export type BodySegment =
  | { type: 'html'; content: string }
  | { type: 'video'; videoId: string; title: string };

const VIDEO_TAG_RE = /\[VIDEO:([a-zA-Z0-9_-]{11}):([^\]]+)\]/g;

/**
 * Parses raw article body HTML into an array of segments.
 */
export function parseArticleBody(rawHtml: string): BodySegment[] {
  const segments: BodySegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(VIDEO_TAG_RE);

  while ((match = regex.exec(rawHtml)) !== null) {
    // HTML before this video tag
    if (match.index > lastIndex) {
      const htmlChunk = rawHtml.slice(lastIndex, match.index);
      segments.push({
        type: 'html',
        content: DOMPurify.sanitize(htmlChunk, {
          ADD_TAGS: ['iframe'],
          ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'loading'],
        }),
      });
    }

    segments.push({
      type: 'video',
      videoId: match[1],
      title: match[2],
    });

    lastIndex = match.index + match[0].length;
  }

  // Remaining HTML after last video tag
  if (lastIndex < rawHtml.length) {
    const htmlChunk = rawHtml.slice(lastIndex);
    segments.push({
      type: 'html',
      content: DOMPurify.sanitize(htmlChunk, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'loading'],
      }),
    });
  }

  return segments;
}
