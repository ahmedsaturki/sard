/**
 * @module @sard/edge-adapter/adapters/cloudflare
 * Cloudflare Workers Edge Adapter for Sard Cloud mode
 */
import type { RuntimeAdapter, RuntimeConfig, RuntimeRequest, RuntimeResponse, RuntimeMetadata } from "@sard/runtime";

export class CloudflareWorkersAdapter implements RuntimeAdapter {
  private middleware: Array<(req: RuntimeRequest, next: () => Promise<RuntimeResponse>) => Promise<RuntimeResponse>> = [];

  async initialize(config: RuntimeConfig): Promise<void> {
    this.middleware = config.middleware || [];
  }

  async handleRequest(request: RuntimeRequest): Promise<RuntimeResponse> {
    // Build middleware chain
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
      body: "Sard Cloudflare Workers",
    };
  }

  async shutdown(): Promise<void> {}

  getMetadata(): RuntimeMetadata {
    return {
      name: "Cloudflare Workers",
      version: "1.0.0",
      environment: "production",
      capabilities: ["edge-caching", "serverless-functions", "websocket", "static-generation"],
    };
  }

  getFetchHandler() {
    return async (request: Request, _env: any, _ctx: any): Promise<Response> => {
      const url = new URL(request.url);
      const runtimeRequest: RuntimeRequest = {
        method: request.method,
        url: url.href,
        headers: Object.fromEntries(request.headers.entries()),
        body: request.body ? request.body : null,
        params: {},
        query: Object.fromEntries(url.searchParams.entries()),
      };

      const response = await this.handleRequest(runtimeRequest);
      
      return new Response(response.body as BodyInit, {
        status: response.status,
        headers: response.headers,
      });
    };
  }
}

export function createCloudflareWorkersAdapter(): CloudflareWorkersAdapter {
  return new CloudflareWorkersAdapter();
}
