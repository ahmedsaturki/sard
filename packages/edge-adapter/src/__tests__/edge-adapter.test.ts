import { describe, it, expect } from "vitest";
import { CloudflareWorkersAdapter } from "./adapters/cloudflare.js";
import { VercelEdgeAdapter } from "./adapters/vercel.js";
import { NodeAdapter } from "./adapters/node.js";

describe("Edge Adapters", () => {
  it("should create Cloudflare Workers adapter", () => {
    const adapter = new CloudflareWorkersAdapter();
    expect(adapter).toBeDefined();
    expect(adapter.getMetadata().name).toBe("Cloudflare Workers");
  });

  it("should create Vercel Edge adapter", () => {
    const adapter = new VercelEdgeAdapter();
    expect(adapter).toBeDefined();
    expect(adapter.getMetadata().name).toBe("Vercel Edge");
  });

  it("should create Node.js adapter", () => {
    const adapter = new NodeAdapter();
    expect(adapter).toBeDefined();
    expect(adapter.getMetadata().name).toBe("Node.js");
  });

  it("should have correct capabilities", () => {
    const cf = new CloudflareWorkersAdapter();
    const vercel = new VercelEdgeAdapter();
    const node = new NodeAdapter();
    
    expect(cf.getMetadata().capabilities).toContain("edge-caching");
    expect(vercel.getMetadata().capabilities).toContain("isr");
    expect(node.getMetadata().capabilities).toContain("websocket");
  });
});
