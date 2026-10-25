/**
 * @module @sard/edge-adapter/adapters/vercel
 * Vercel Edge Adapter for Sard Cloud mode
 */
import type { RuntimeAdapter, RuntimeConfig, RuntimeRequest, RuntimeResponse, RuntimeMetadata } from "@sard/runtime";

export class VercelEdgeAdapter implements RuntimeAdapter {
  private middleware: Array<(req: RuntimeRequest, next: () => Promise<RuntimeResponse>) => Promise<RuntimeResponse>> = [];

  async initialize(config: RuntimeConfig): Promise<void> {
    this.middleware = config.middleware || [];
  }

  async handleRequest(request: RuntimeRequest): Promise<RuntimeResponse> {
    const handler = this.middleware.reduceRight(
      (next: () => Promise<RuntimeResponse>, middleware: (req: RuntimeRequest, next: () => Promise<RuntimeResponse>) => Promise<RuntimeResponse>) => 
        () => middleware(request, next),
      () => this.handleRoute(request)
    );
    
    return handler();
  }

  private async handleRoute(_request: RuntimeRequest): Promise<RuntimeResponse> {
    return {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: "Sard Vercel Edge",
    };
  }

  async shutdown(): Promise<void> {}

  getMetadata(): RuntimeMetadata {
    return {
      name: "Vercel Edge",
      version: "1.0.0",
      environment: "production",
      capabilities: ["edge-caching", "serverless-functions", "isr", "static-generation"],
    };
  }
}

export function createVercelEdgeAdapter(): VercelEdgeAdapter {
  return new VercelEdgeAdapter();
}
