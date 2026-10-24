import { describe, it, expect } from "vitest";
import { validateDocument } from "../validate.js";
import type { Document } from "../types.js";

const minimalDoc: Document = {
  _type: "content",
  blocks: [{
    _type: "block",
    style: "normal",
    children: [{ _type: "span", text: "Hello world", marks: [] }]
  }]
};

describe("validateDocument", () => {
  it("accepts a minimal valid document", () => {
    const result = validateDocument(minimalDoc);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data._type).toBe("content");
  });

  it("rejects a document with no blocks", () => {
    const result = validateDocument({ _type: "content", blocks: [] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects a block with empty children", () => {
    const result = validateDocument({
      _type: "content",
      blocks: [{ _type: "block", style: "normal", children: [] }]
    });
    expect(result.success).toBe(false);
  });

  it("accepts headings and lists", () => {
    const doc: Document = {
      _type: "content",
      blocks: [
        { _type: "block", style: "h1", children: [{ _type: "span", text: "Title", marks: [] }] },
        { _type: "block", style: "normal", listItem: "bullet", children: [{ _type: "span", text: "Item", marks: [] }] }
      ]
    };
    const result = validateDocument(doc);
    expect(result.success).toBe(true);
  });

  it("accepts image blocks", () => {
    const doc: Document = {
      _type: "content",
      blocks: [{ _type: "image", url: "/img.png", alt: "Alt", width: 400, height: 300 }]
    };
    const result = validateDocument(doc);
    expect(result.success).toBe(true);
  });

  it("rejects invalid image (missing url)", () => {
    const result = validateDocument({
      _type: "content",
      blocks: [{ _type: "image", url: "", alt: "x" }]
    });
    expect(result.success).toBe(false);
  });
});
