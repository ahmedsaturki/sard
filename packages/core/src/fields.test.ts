import { describe, it, expect } from "vitest";
import { validateCollection, validatePluginManifest, resolveGrantedCapabilities } from "../index.js";

describe("validateCollection", () => {
  it("accepts a minimal valid collection", () => {
    const result = validateCollection({
      slug: "posts",
      title: "Posts",
      fields: [{ name: "title", type: "text", label: "Title" }]
    });
    expect(result.success).toBe(true);
  });

  it("rejects a collection with no fields", () => {
    const result = validateCollection({ slug: "posts", title: "Posts", fields: [] });
    expect(result.success).toBe(false);
  });

  it("rejects invalid field name", () => {
    const result = validateCollection({
      slug: "posts",
      title: "Posts",
      fields: [{ name: "123invalid", type: "text", label: "Title" }]
    });
    expect(result.success).toBe(false);
  });

  it("requires options for select", () => {
    const result = validateCollection({
      slug: "posts",
      title: "Posts",
      fields: [{ name: "status", type: "select", label: "Status", options: [] }]
    });
    expect(result.success).toBe(false);
  });
});

describe("validatePluginManifest", () => {
  it("accepts a valid manifest", () => {
    const result = validatePluginManifest({
      name: "seo-plugin",
      version: "1.0.0",
      capabilities: ["content:read", "content:write"]
    });
    expect(result.success).toBe(true);
  });

  it("rejects manifest without capabilities", () => {
    const result = validatePluginManifest({
      name: "seo-plugin",
      version: "1.0.0",
      capabilities: []
    });
    expect(result.success).toBe(false);
  });
});

describe("resolveGrantedCapabilities", () => {
  it("returns intersection of requested and granted", () => {
    const manifest = {
      name: "test",
      version: "1.0.0",
      capabilities: ["content:read", "content:write", "users:read"]
    };
    const granted = resolveGrantedCapabilities(manifest, ["content:read", "email:send"]);
    expect(granted).toEqual(["content:read"]);
  });
});
