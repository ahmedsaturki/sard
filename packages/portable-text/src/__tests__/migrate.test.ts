import { describe, it, expect } from "vitest";
import { migrateHtmlToPortableText } from "../migrate.js";
import { validateDocument } from "../validate.js";
import type { ContentBlock, TextSpan } from "../types.js";

describe("migrateHtmlToPortableText", () => {
  it("converts simple paragraph", () => {
    const doc = migrateHtmlToPortableText("<p>Hello world</p>");
    expect(doc.blocks.length).toBe(1);
    const b0 = doc.blocks[0];
    expect(b0).toBeDefined();
    if (b0) {
      expect(b0._type).toBe("block");
      const block = b0 as ContentBlock;
      expect(block.children[0]).toBeDefined();
      const span = block.children[0] as TextSpan;
      expect(span.text).toBe("Hello world");
    }
  });
  it("converts headings", () => {
    const doc = migrateHtmlToPortableText("<h2>Title</h2>");
    expect(doc.blocks.length).toBeGreaterThan(0);
    const b0 = doc.blocks[0];
    expect(b0).toBeDefined();
    if (b0) {
      const block = b0 as ContentBlock;
      expect(block.style).toBe("h2");
      expect(block.level).toBe(2);
    }
  });
  it("converts bold/italic/underline", () => {
    const doc = migrateHtmlToPortableText("<p><strong>Bold</strong> <em>Italic</em> <u>Under</u></p>");
    expect(doc.blocks.length).toBeGreaterThan(0);
    const b0 = doc.blocks[0];
    expect(b0).toBeDefined();
    if (b0) {
      const block = b0 as ContentBlock;
      expect(block.children.some((s) => s.marks.includes("strong"))).toBe(true);
      expect(block.children.some((s) => s.marks.includes("em"))).toBe(true);
      expect(block.children.some((s) => s.marks.includes("underline"))).toBe(true);
    }
  });
  it("converts links", () => {
    const doc = migrateHtmlToPortableText('<p><a href="/page">Link</a></p>');
    expect(doc.blocks.length).toBeGreaterThan(0);
    const b0 = doc.blocks[0];
    expect(b0).toBeDefined();
    if (b0) {
      const block = b0 as ContentBlock;
      expect(block.children.some((s) => s.marks.some((m: string) => m.startsWith("link:")))).toBe(true);
    }
  });
  it("converts images", () => {
    const doc = migrateHtmlToPortableText('<img src="/pic.jpg" alt="Alt" />');
    const b0 = doc.blocks[0];
    expect(b0).toBeDefined();
    if (b0) {
      expect(b0._type).toBe("image");
      expect((b0 as { url: string }).url).toBe("/pic.jpg");
    }
  });
  it("output passes validateDocument", () => {
    const html = "<h1>Title</h1><p>Text</p><img src=\"/i.jpg\" alt=\"/\" />";
    const doc = migrateHtmlToPortableText(html);
    const result = validateDocument(doc);
    expect(result.success).toBe(true);
  });
});
