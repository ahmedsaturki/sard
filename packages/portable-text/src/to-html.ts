import type { Block, ContentBlock, Document, ImageBlock, TextSpan } from "./types.js";
import { escapeHtml } from "./escape.js";

export interface RenderOptions {
  /** Base URL prefix for relative image URLs. */
  baseUrl?: string;
}

const BLOCK_TAG: Record<string, string> = {
  normal: "p",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  blockquote: "blockquote",
  code: "pre",
};

function renderSpans(spans: readonly TextSpan[]): string {
  return spans
    .map((span) => {
      const safeText = span.text !== undefined && span.text !== null ? escapeHtml(span.text) : "";
      let html = safeText;
      if (span.marks.includes("strong")) html = "<strong>" + html + "</strong>";
      if (span.marks.includes("em")) html = "<em>" + html + "</em>";
      if (span.marks.includes("underline")) html = "<u>" + html + "</u>";
      if (span.marks.includes("code")) html = "<code>" + html + "</code>";
      const link = span.marks.find((m) => m.startsWith('link:'));
      if (link !== undefined) {
        const href = link.slice("link:".length);
        const safeHref = href !== undefined && href !== null ? escapeHtml(href) : "#";
        const safeHtml = span.text !== undefined && span.text !== null ? escapeHtml(span.text) : "";
        html = '<a href="' + safeHref + '" rel="noopener noreferrer">' + safeHtml + '</a>';
      }
      return html;
    })
    .join("");
}

function renderBlock(block: Block, opts: RenderOptions): string {
  if (block._type === "image") {
    const img = block as ImageBlock;
    const url = img.url.startsWith("http") || img.url.startsWith("/") ? img.url : (opts.baseUrl ?? "") + img.url;
    const alt = img.alt !== undefined && img.alt !== null ? escapeHtml(img.alt) : "";
    const width = img.width !== undefined && img.width !== null ? img.width : 0;
    const height = img.height !== undefined && img.height !== null ? img.height : 0;
    const dims = width !== 0 && height !== 0 ? ' width="' + width + '" height="' + height + '"' : '';
    const imgTag = '<img src="' + escapeHtml(url) + '" alt="' + alt + '"' + dims + ' loading="lazy" />';
    const caption = img.caption !== undefined && img.caption !== null && img.caption !== '' ? '<figcaption>' + escapeHtml(img.caption) + '</figcaption>' : '';
    return caption !== '' ? '<figure>' + imgTag + caption + '</figure>' : imgTag;
  }
  if (block._type === "custom") {
    const data = JSON.stringify(block.value ?? {}).replace(/</g, "\\u003c");
    return '<sard-block name="' + escapeHtml(block.name) + '" data-value="' + escapeHtml(data) + '"></sard-block>';
  }
  const cb = block as ContentBlock;
  const inner = renderSpans(cb.children);
  if (cb.listItem === 'bullet' || cb.listItem === 'number') {
    const li = "<li>" + inner + "</li>";
    return cb.listItem === 'bullet' ? '<ul>' + li + '</ul>' : '<ol>' + li + '</ol>';
  }
  if (cb.style === 'code') {
    return '<pre><code>' + inner + '</code></pre>';
  }
  const tag = cb.style ? (BLOCK_TAG[cb.style] ?? 'p') : 'p';
  return '<' + tag + '>' + inner + '</' + tag + '>';
}

/**
 * Render a Portable Text document to semantic, clean HTML.
 * All text is escaped (XSS-safe) and image dimensions are preserved (CLS-safe).
 */
export function toHtml(document: Document, opts: RenderOptions = {}): string {
  return document.blocks.map((b) => renderBlock(b, opts)).join("\n");
}