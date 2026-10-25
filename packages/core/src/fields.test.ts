import { describe, it, expect } from "vitest";
import { validateCollection } from "./fields.js";
import { validatePluginManifest, resolveGrantedCapabilities, CapabilityValue } from "./capabilities.js";

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
  it("accepts select with options", () => {
    const result = validateCollection({
      slug: "posts",
      title: "Posts",
      fields: [{ name: "status", type: "select", label: "Status", options: ["draft", "published"] }]
    });
    expect(result.success).toBe(true);
  });
});

describe("validatePluginManifest", () => {
  it("accepts a valid manifest", () => {
    const result = validatePluginManifest({
      name: "seo-plugin",
      version: "1.0.0",
      capabilities: ["content:read", "content:write"] as CapabilityValue[] 
    });
    expect(result.success).toBe(true);
  });
  it("rejects manifest without capabilities", () => {
    const result = validatePluginManifest({
      name: "seo-plugin",
      version: "1.0.0",
      capabilities: [] as CapabilityValue[] 
    });
    expect(result.success).toBe(false);
  });
});

describe("resolveGrantedCapabilities", () => {
  it("returns intersection of requested and granted", () => {
    const manifest = {
      name: "test",
      version: "1.0.0",
      capabilities: ["content:read", "content:write", "users:read"] as CapabilityValue[]
    };
    const granted = resolveGrantedCapabilities(manifest, ["content:read", "email:send"] );
    expect(granted).toEqual(["content:read"]);
  });
});
