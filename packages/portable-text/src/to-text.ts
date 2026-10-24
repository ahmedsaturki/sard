import type { ContentBlock, Document, ImageBlock } from "./types.js";
import { collapseWhitespace } from "./escape.js";

/**
 * Render a Portable Text document to plain text — for email, meta
 * descriptions, search indexing, and agent ingestion.
 */
export function toPlainText(document: Document, opts: { separator?: string } = {}): string {
  const sep = opts.separator ?? "\n\n";
  const parts: string[] = [];
  for (const block of document.blocks) {
    if (block._type === "block") {
      const cb = block as ContentBlock;
      const text = cb.children.map((s) => s.text).join("");
      parts.push(collapseWhitespace(text).trim());
    } else if (block._type === "image") {
      const img = block as ImageBlock;
      parts.push("[" + (img.alt ?? "[image]") + "]");
    } else {
      parts.push("[" + (block as { name: string }).name + "]");
    }
  }
  return parts.filter((p) => p.length > 0).join(sep);
}

/**
 * Extract a "direct answer" summary (up to maxWords words) from a document
 * for AEO/GEO — Answer Engine Optimization. Trims at the last sentence end
 * before the word budget so summaries read naturally.
 */
export function directAnswer(document: Document, maxWords = 60): string {
  const text = toPlainText(document, { separator: " " });
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  let out = words.slice(0, maxWords).join(" ");
  const lastDot = out.lastIndexOf(".");
  if (lastDot > maxWords * 0.4) out = out.slice(0, lastDot + 1);
  return out;
}
