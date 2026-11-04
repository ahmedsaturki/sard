/**
 * @module @sard-cms/admin/static-export
 *
 * Static Site Export functionality for Sard Admin.
 * Generates static HTML/CSS/JS for shared hosting deployment.
 * See ADR-009 (Deployment Modes).
 */

import { generateCssVariables, tokens } from '@sard-cms/components';

/**
 * Static export configuration
 */
export interface StaticExportConfig {
  outputDir: string;
  basePath: string;
  routes: string[];
  includeAssets: boolean;
  minify: boolean;
  generateSitemap: boolean;
  generateRobotsTxt: boolean;
}

/**
 * Default static export configuration
 */
export const defaultStaticExportConfig: StaticExportConfig = {
  outputDir: 'dist/static',
  basePath: '/',
  routes: [
    '/',
    '/login',
    '/dashboard',
    '/collections',
    '/media',
    '/settings',
  ],
  includeAssets: true,
  minify: true,
  generateSitemap: true,
  generateRobotsTxt: true,
};

/**
 * Static site generator for Sard Admin
 */
export class StaticSiteGenerator {
  private config: StaticExportConfig;
  private htmlTemplate: string;

  constructor(config: Partial<StaticExportConfig> = {}) {
    this.config = { ...defaultStaticExportConfig, ...config };
    this.htmlTemplate = this.generateHtmlTemplate();
  }

  /**
   * Generate the base HTML template with design tokens
   */
  private generateHtmlTemplate(): string {
    const cssVariables = generateCssVariables(tokens);
    
    return `<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Sard Admin - Content Operating System Dashboard" />
    <title>Sard Admin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>${cssVariables}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  }

  /**
   * Generate static HTML for a specific route
   */
  async generateRoute(route: string, data?: Record<string, any>): Promise<string> {
    // For static export, we pre-render the HTML
    // In a real implementation, this would use React's renderToString
    // For now, return the base template
    return this.htmlTemplate;
  }

  /**
   * Generate all static routes
   */
  async generateAll(): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    for (const route of this.config.routes) {
      const html = await this.generateRoute(route);
      results.set(route, html);
    }
    
    return results;
  }

  /**
   * Write static files to disk
   */
  async writeToDisk(outputDir: string = this.config.outputDir): Promise<void> {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    
    const routes = await this.generateAll();
    
    for (const [route, html] of routes) {
      const filePath = route === '/' ? 'index.html' : `${route.replace(/^\//, '')}/index.html`;
      const fullPath = path.join(outputDir, filePath);
      
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, html);
    }
    
    // Generate sitemap.xml
    if (this.config.generateSitemap) {
      const sitemap = this.generateSitemap();
      await fs.writeFile(path.join(outputDir, 'sitemap.xml'), sitemap);
    }
    
    // Generate robots.txt
    if (this.config.generateRobotsTxt) {
      const robots = this.generateRobotsTxt();
      await fs.writeFile(path.join(outputDir, 'robots.txt'), robots);
    }
    
    // Copy assets if needed
    if (this.config.includeAssets) {
      await this.copyAssets(outputDir);
    }
  }

  /**
   * Generate sitemap.xml
   */
  private generateSitemap(): string {
    const baseUrl = 'https://example.com';
    const urls = this.config.routes.map(route => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }

  /**
   * Generate robots.txt
   */
  private generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
`;
  }

  /**
   * Copy static assets
   */
  private async copyAssets(outputDir: string): Promise<void> {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    
    // Copy fonts, images, etc.
    const assetsDir = path.join(process.cwd(), 'public');
    const destDir = path.join(outputDir, 'assets');
    
    try {
      await fs.cp(assetsDir, destDir, { recursive: true });
    } catch {
      // Assets directory might not exist
    }
  }
}

/**
 * CLI command to run static export
 */
export async function runStaticExport(config: Partial<StaticExportConfig> = {}): Promise<void> {
  const generator = new StaticSiteGenerator(config);
  await generator.writeToDisk();
  console.log('Static export completed successfully!');
}

export default {
  StaticSiteGenerator,
  runStaticExport,
  defaultStaticExportConfig,
};

