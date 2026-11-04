/**
 * @module @sard-cms/edge-adapter/adapters/node
 * Node.js HTTP Server Adapter for Sard Lite mode
 */
import type { RuntimeAdapter, RuntimeConfig, RuntimeRequest, RuntimeResponse, RuntimeMetadata } from "@sard-cms/runtime";
import http from "http";

export class NodeAdapter implements RuntimeAdapter {
  private middleware: Array<(req: RuntimeRequest, next: () => Promise<RuntimeResponse>) => Promise<RuntimeResponse>> = [];
  private server: http.Server | null = null;

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
      body: "Sard Node.js",
    };
  }

  async shutdown(): Promise<void> {
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => resolve());
      });
      this.server = null;
    }
  }

  getMetadata(): RuntimeMetadata {
    return {
      name: "Node.js",
      version: "1.0.0",
      environment: "production",
      capabilities: ["websocket", "streaming-ssr", "serverless-functions"],
    };
  }

  getRequestHandler() {
    return async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
      const url = req.url ? new URL(req.url, 'http://localhost') : new URL('http://localhost');
      const runtimeRequest: RuntimeRequest = {
        method: req.method || 'GET',
        url: url.href,
        headers: req.headers as Record<string, string>,
        body: null,
        params: {},
        query: Object.fromEntries(url.searchParams.entries()),
      };

      const response = await this.handleRequest(runtimeRequest);
      
      res.writeHead(response.status, response.headers);
      res.end(response.body || '');
    };
  }

  startServer(port: number): void {
    this.server = http.createServer(async (req, res) => {
      const handler = this.getRequestHandler();
      await handler(req, res);
    });
    
    this.server.listen(port);
    console.log('Sard Node.js server listening on port ' + port);
  }
}

export function createNodeAdapter(): NodeAdapter {
  return new NodeAdapter();
}

