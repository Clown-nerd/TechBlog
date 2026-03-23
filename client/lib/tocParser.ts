/**
 * Table-of-contents generator.
 * Parses article HTML on the server and extracts H2/H3 elements
 * with generated anchor IDs.
 */

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const HEADING_RE = /<h([23])([^>]*)>([\s\S]*?)<\/h[23]>/gi;
const STRIP_TAGS = /<[^>]*>/g;

/**
 * Extracts heading items from raw HTML and returns:
 *  - `toc`: array of { id, text, level }
 *  - `html`: the original HTML with `id` attributes injected into headings
 */
export function generateToc(html: string): { toc: TocItem[]; html: string } {
  const toc: TocItem[] = [];
  const seenIds = new Set<string>();

  const enhanced = html.replace(HEADING_RE, (match, level, attrs, inner) => {
    const text = inner.replace(STRIP_TAGS, '').trim();
    let id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Deduplicate IDs
    if (seenIds.has(id)) {
      let i = 2;
      while (seenIds.has(`${id}-${i}`)) i++;
      id = `${id}-${i}`;
    }
    seenIds.add(id);

    toc.push({ id, text, level: parseInt(level, 10) as 2 | 3 });

    return `<h${level} id="${id}"${attrs}>${inner}</h${level}>`;
  });

  return { toc, html: enhanced };
}
