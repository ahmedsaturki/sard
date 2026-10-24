import { describe, it, expect } from "vitest";
import { toHtml } from "../to-html.js";
import { toPlainText, directAnswer } from "../to-text.js";
import type { Document } from "../types.js";

const doc: Document = {
  _type: "content",
  blocks: [
    { _type: "block", style: "h1", children: [{ _type: "span", text: "Hello", marks: ["strong"] }] },
    { _type: "block", style: "normal", children: [{ _type: "span", text: "World", marks: [] }] },
    { _type: "image", url: "/test.png", alt: "Test image", caption: "Caption", width: 100, height: 100 }
  ]
};

describe("toHtml", () => {
  it("renders heading with strong", () => {
    const html = toHtml(doc);
    expect(html).toContain("<h1>");
    expect(html).toContain("<strong>Hello</strong>");
  });
  it("renders image with dimensions and lazy loading", () => {
    const html = toHtml(doc);
    expect(html).toContain('src="/test.png"');
    expect(html).toContain('alt="Test image"');
    expect(html).toContain('width="100" height="100"');
    expect(html).toContain('loading="lazy"');
  });
  it("renders caption in figure/figcaption", () => {
    const html = toHtml(doc);
    expect(html).toContain("<figure>");
    expect(html).toContain("<figcaption>Caption</figcaption>");
  });
});

describe("toPlainText", () => {
  it("returns plain text without markup", () => {
    const text = toPlainText(doc);
    expect(text).toContain("Hello");
    expect(text).toContain("World");
    expect(text).toContain("[Test image]");
  });
});

describe("directAnswer", () => {
  it("truncates to maxWords and trims at sentence end", () => {
    const long: Document = {
      _type: "content",
      blocks: [{
        _type: "block",
        style: "normal",
        children: [{ _type: "span", text: "One two three four five six seven eight nine ten.", marks: [] }]
      }]
    };
    const ans = directAnswer(long, 5);
    expect(ans.split(/\s+/).length).toBeLessThanOrEqual(5);
  });
});
