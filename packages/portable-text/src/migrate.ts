import type { Block, ContentBlock, Document, TextSpan } from "./types.js";

/**
 * Minimal best-effort HTML to Portable Text migration.
 * Handles the tag set found in real WordPress exports:
 * p, h1-h6, ul/ol/li, blockquote, pre/code, img, a, strong/b, em/i, u, br.
 *
 * NOTE: This is a lossy heuristic migrator — output must pass through
 * validateDocument() and be reviewed before publish. See docs/adr/003-content-format.md risks.
 */

const VOID_TAGS = new Set(["br", "img", "hr", "input", "meta", "link"]);
const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

interface Node {
  tag: string;
  attrs: Record<string, string>;
  children: (Node | string)[];
}

function parseHtml(html: string): (Node | string)[] {
  const root: Node = { tag: "#root", attrs: {}, children: [] };
  const stack: Node[] = [root];
  const re = /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:[^">']|"[^"]*"|'[^']*')?)?)*)\s*(\/?)>|([^<]+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const top = stack[stack.length - 1];
    if (!top) continue;
    if (match[4] !== undefined) {
      top.children.push(match[4]);
      continue;
    }
    const tag = match[1] ?? "";
    const lowerTag = tag.toLowerCase();
    const selfClose = match[3] === "/" || VOID_TAGS.has(lowerTag);
    const isClose = match[0] && match[0][1] === "/";
    if (isClose) {
      for (let i = stack.length - 1; i > 0; i--) {
        const entry = stack[i];
        if (entry && entry.tag === lowerTag) {
          stack.length = i;
          break;
        }
      }
      continue;
    }
    const attrs: Record<string, string> = {};
    const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
    let am: RegExpExecArray | null;
    const attrStr = match[2] ?? "";
    while ((am = attrRe.exec(attrStr)) !== null) {
      const k = am[1];
      const v = am[3] ?? am[4] ?? am[5];
      if (k && v) attrs[k.toLowerCase()] = v;
    }
    const node: Node = { tag: lowerTag, attrs, children: [] };
    top.children.push(node);
    if (!selfClose) stack.push(node);
  }
  return root.children;
}

function stripTags(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

function nodeToText(node: Node | string): string {
  if (typeof node === "string") return node;
  return node.children.map(nodeToText).join("");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/&nbsp;/g, " ");
}

function inlineToSpans(children: (Node | string)[], marks: string[] = []): TextSpan[] {
  const spans: TextSpan[] = [];
  for (const child of children) {
    if (typeof child === "string") {
      const text = decodeEntities(child);
      if (text.length > 0) spans.push({ _type: "span", text, marks: [...marks] });
      continue;
    }
    const tag = child.tag;
    if (tag === "strong" || tag === "b") {
      spans.push(...inlineToSpans(child.children, [...marks, "strong"]));
    } else if (tag === "em" || tag === "i") {
      spans.push(...inlineToSpans(child.children, [...marks, "em"]));
    } else if (tag === "u") {
      spans.push(...inlineToSpans(child.children, [...marks, "underline"]));
    } else if (tag === "code") {
      spans.push(...inlineToSpans(child.children, [...marks, "code"]));
    } else if (tag === "a") {
      const href = child.attrs["href"];
      if (href) {
        spans.push(...inlineToSpans(child.children, [...marks, "link:" + href]));
      } else {
        spans.push(...inlineToSpans(child.children, marks));
      }
    } else if (tag === "br") {
      spans.push({ _type: "span", text: " ", marks: [...marks] });
    } else if (tag === "img") {
      const url = child.attrs["src"] ?? "";
      if (url) {
        spans.push({ _type: "span", text: "", marks: [] });
        spans.push({
          _type: "span",
          text: child.attrs["alt"] ?? "[image]",
          marks: []
        });
      }
    } else {
      spans.push(...inlineToSpans(child.children, marks));
    }
  }
  const merged: TextSpan[] = [];
  for (const span of spans) {
    const last = merged[merged.length - 1];
    if (
      last &&
      JSON.stringify(last.marks) === JSON.stringify(span.marks) &&
      span._type === "span" &&
      last._type === "span"
    ) {
      merged[merged.length - 1] = { ...last, text: last.text + span.text };
    } else {
      merged.push({ ...span });
    }
  }
  return merged.filter((s) => s.text.length > 0 || s.marks.length > 0);
}

function blockFromNode(node: Node): Block | null {
  const tag = node.tag;
  if (HEADING_TAGS.has(tag)) {
    const style = tag as ContentBlock["style"];
    return {
      _type: "block",
      style,
      children: inlineToSpans(node.children),
      level: parseInt(tag.slice(1), 10)
    };
  }
  if (tag === "p" || tag === "div" || tag === "section") {
    // Process all children (strings and nodes) through inlineToSpans
    const spans = inlineToSpans(node.children);
    if (spans.length === 0) return null;
    return { _type: "block", style: "normal", children: spans };
  }
  if (tag === "blockquote") {
    return { _type: "block", style: "blockquote", children: inlineToSpans(node.children) };
  }
  if (tag === "pre") {
    const code = node.children.find((c): c is Node => typeof c !== "string" && c.tag === "code");
    const source = stripTags(nodeToText(code ?? node));
    return {
      _type: "block",
      style: "code",
      children: [{ _type: "span", text: source, marks: [] }]
    };
  }
  if (tag === "ul" || tag === "ol") {
    const items = node.children.filter((c): c is Node => typeof c !== "string" && c.tag === "li");
    if (items.length === 0) return null;
    const out: Block[] = items.map((li) => ({
      _type: "block",
      style: "normal",
      listItem: tag === "ul" ? "bullet" : "number",
      children: inlineToSpans(li.children)
    }));
    (out as unknown as { __multi?: Block[] }).__multi = out;
    return out[0] ?? null;
  }
  if (tag === "img") {
    return {
      _type: "image",
      url: node.attrs["src"] ?? "",
      alt: node.attrs["alt"] ?? "",
      caption: node.attrs["title"] ?? ""
    };
  }
  const flat: Block[] = [];
  for (const child of node.children) {
    if (typeof child === "string") {
      const t = decodeEntities(child).trim();
      if (t) flat.push({ _type: "block", style: "normal", children: [{ _type: "span", text: t, marks: [] }] });
    } else {
      const b = blockFromNode(child);
      if (b) {
        const multi = (b as unknown as { __multi?: Block[] }).__multi;
        if (multi) flat.push(...multi);
        else flat.push(b);
      }
    }
  }
  if (flat.length === 1) {
    return flat[0] ?? null;
  }
  if (flat.length > 1) {
    return { _type: "custom", name: "fragment", value: { blocks: flat } };
  }
  return null;
}

/**
 * Migrate raw HTML (e.g. a WordPress wp_postmeta post_content) to a
 * Portable Text Document. Output should be validated with validateDocument()
 * and reviewed before publishing.
 */
export function migrateHtmlToPortableText(html: string): Document {
  const nodes = parseHtml(html);
  const blocks: Block[] = [];
  for (const node of nodes) {
    if (typeof node === "string") {
      const t = decodeEntities(node).trim();
      if (t) blocks.push({ _type: "block", style: "normal", children: [{ _type: "span", text: t, marks: [] }] });
    } else {
      const b = blockFromNode(node);
      if (b) {
        const multi = (b as unknown as { __multi?: Block[] }).__multi;
        if (multi) blocks.push(...multi);
        else blocks.push(b);
      }
    }
  }
  return { _type: "content", blocks };
}
