/**
 * @module @sard/wp-compat/generators/AstroGenerator
 *
 * Generates Astro components and configuration from parsed WP theme.
 */

import type { ConversionOptions } from "../types/index.js";
import { defaultConversionOptions } from "../converters/options.js";

export class AstroGenerator {
  private options: ConversionOptions;

  constructor(options: Partial<ConversionOptions> = {}) {
    this.options = { ...defaultConversionOptions, ...options };
  }

  /**
   * Generate complete Astro project from parsed WP theme
   */
  async generate(parsedTheme: { theme: any; themeJson?: any }): Promise<Map<string, string>> {
    const files = new Map<string, string>();

    // Generate package.json
    files.set("package.json", this.generatePackageJson(parsedTheme.theme));

    // Generate astro.config.mjs
    files.set("astro.config.mjs", this.generateAstroConfig(parsedTheme.theme));

    // Generate sard.config.ts
    if (this.options.generateSardConfig) {
      files.set("sard.config.ts", this.generateSardConfig(parsedTheme.theme));
    }

    // Generate global styles
    files.set("src/styles/global.css", this.generateGlobalStyles(parsedTheme.theme, parsedTheme.themeJson));

    // Generate layout
    files.set("src/layouts/Layout.astro", this.generateLayout(parsedTheme.theme));

    // Generate components
    const components = this.generateComponents(parsedTheme.theme);
    for (const [name, code] of components) {
      files.set("src/components/" + name + ".astro", code);
    }

    // Generate pages
    const pages = this.generatePages(parsedTheme.theme);
    for (const [path, code] of pages) {
      files.set("src/pages/" + path, code);
    }

    // Generate theme.json if conversion enabled
    if (this.options.convertThemeJson && parsedTheme.themeJson) {
      files.set("theme.json", JSON.stringify(parsedTheme.themeJson, null, 2));
    }

    return files;
  }

  private generatePackageJson(theme: any): string {
    return JSON.stringify({
      name: "sard-" + theme.name.toLowerCase().replace(/\s+/g, "-"),
      version: theme.version,
      private: true,
      type: "module",
      scripts: {
        dev: "astro dev",
        build: "astro build",
        preview: "astro preview",
        "sard:dev": "sard dev",
        "sard:build": "sard build",
      },
      dependencies: {
        astro: "^4.16.0",
        "@sard/core": "workspace:*",
        "@sard/design-tokens": "workspace:*",
        "@sard/components": "workspace:*",
        "@sard/visual-editor": "workspace:*",
      },
      devDependencies: {
        "@astrojs/check": "^0.9.0",
        "@types/node": "^22.0.0",
        typescript: "^5.7.2",
      },
    }, null, 2);
  }

  private generateAstroConfig(_theme: any): string {
    return "import { defineConfig } from 'astro/config';\nimport sard from '@sard/astro-integration';\n\nexport default defineConfig({\n  site: 'https://example.com',\n  integrations: [sard()],\n  vite: {\n    ssr: {\n      noExternal: ['@sard/*'],\n    },\n  },\n});";
  }

  private generateSardConfig(_theme: any): string {
    return "import { defineConfig } from '@sard/core';\n\nexport default defineConfig({\n  site: {\n    name: '" + _theme.name + "',\n    url: 'https://example.com',\n  },\n  content: {\n    collections: ['posts', 'pages'],\n  },\n  theme: {\n    name: '" + _theme.name + "',\n    extends: 'base',\n  },\n});";
  }

  private generateGlobalStyles(_theme: any, themeJson?: any): string {
    let css = "/* Global styles for " + _theme.name + " */\n:root {\n  --sard-color-brand-primary-500: #0ea5e9;\n  --sard-color-brand-primary-600: #0284c7;\n  --sard-color-brand-secondary-500: #d946ef;\n  --sard-color-neutral-0: #ffffff;\n  --sard-color-neutral-50: #fafafa;\n  --sard-color-neutral-100: #fafafa;\n  --sard-color-neutral-200: #e5e5e5;\n  --sard-color-neutral-300: #d4d4d4;\n  --sard-color-neutral-400: #a3a3a3;\n  --sard-color-neutral-500: #737373;\n  --sard-color-neutral-600: #525252;\n  --sard-color-neutral-700: #404040;\n  --sard-color-neutral-800: #262626;\n  --sard-color-neutral-900: #171717;\n  --sard-color-neutral-950: #0a0a0a;\n  --sard-color-semantic-success-main: #059669;\n  --sard-color-semantic-warning-main: #d97706;\n  --sard-color-semantic-error-main: #dc2626;\n  --sard-color-semantic-info-main: #2563eb;\n  --sard-color-text-primary: #171717;\n  --sard-color-text-secondary: #525252;\n  --sard-color-text-tertiary: #737373;\n  --sard-color-border-light: #e5e5e5;\n  --sard-color-border-main: #d4d4d4;\n  --sard-color-border-focus: #0ea5e9;\n  --sard-font-family-sans: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n  --sard-font-family-mono: 'JetBrains Mono', 'Fira Code', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;\n  --sard-spacing-1: 0.25rem;\n  --sard-spacing-2: 0.5rem;\n  --sard-spacing-3: 0.75rem;\n  --sard-spacing-4: 1rem;\n  --sard-spacing-5: 1.25rem;\n  --sard-spacing-6: 1.5rem;\n  --sard-spacing-8: 2rem;\n  --sard-radius-sm: 0.125rem;\n  --sard-radius-base: 0.25rem;\n  --sard-radius-md: 0.375rem;\n  --sard-radius-lg: 0.5rem;\n  --sard-radius-xl: 0.75rem;\n  --sard-radius-2xl: 1rem;\n  --sard-radius-3xl: 1.5rem;\n  --sard-radius-full: 9999px;\n  --sard-shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);\n  --sard-shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);\n  --sard-transition-fast: 100ms;\n  --sard-transition-normal: 150ms;\n  --sard-z-dropdown: 100;\n  --sard-z-modal: 500;\n  --sard-breakpoint-sm: 640px;\n  --sard-breakpoint-md: 768px;\n  --sard-breakpoint-lg: 1024px;\n  --sard-breakpoint-xl: 1280px;\n  --sard-breakpoint-2xl: 1536px;\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --sard-color-background-primary: var(--sard-color-neutral-950);\n    --sard-color-background-secondary: var(--sard-color-neutral-900);\n    --sard-color-background-tertiary: var(--sard-color-neutral-800);\n    --sard-color-background-canvas: var(--sard-color-neutral-950);\n    --sard-color-text-primary: var(--sard-color-neutral-0);\n    --sard-color-text-secondary: var(--sard-color-neutral-400);\n    --sard-color-text-tertiary: var(--sard-color-neutral-500);\n    --sard-color-border-light: var(--sard-color-neutral-800);\n    --sard-color-border-main: var(--sard-color-neutral-700);\n    --sard-color-surface-primary: var(--sard-color-neutral-900);\n    --sard-color-surface-secondary: var(--sard-color-neutral-800);\n    --sard-color-surface-tertiary: var(--sard-color-neutral-800);\n  }\n}";

    // Add theme.json colors if available
    if (themeJson?.settings?.color?.palette) {
      css += "\n/* Theme colors from theme.json */\n";
      for (const color of themeJson.settings.color.palette) {
        css += "--sard-color-" + color.slug + ": " + color.color + ";\n";
      }
    }

    return css;
  }

  private generateLayout(_theme: any): string {
    return "---\ninterface Props {\n  title: string;\n  children: any;\n}\nconst { title, children } = Astro.props;\n---\n<!doctype html>\n<html lang=\"en\" dir=\"ltr\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <meta name=\"generator\" content={Astro.generator} />\n    <title>{title} | " + _theme.name + "</title>\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/favicon.svg\" />\n    <meta name=\"description\" content=\"" + _theme.description + "\" />\n  </head>\n  <body class=\"layout\">\n    <slot />\n  </body>\n</html>";
  }

  private generateComponents(_theme: any): Map<string, string> {
    const components = new Map<string, string>();

    // Button component
    components.set("Button.astro", "---\ninterface Props {\n  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';\n  size?: 'sm' | 'md' | 'lg';\n  href?: string;\n  disabled?: boolean;\n  children: any;\n}\nconst { variant = 'primary', size = 'md', href, disabled, children, ...attrs } = Astro.props;\nconst Component = href ? 'a' : 'button';\nconst classes = 'btn btn-' + variant + ' btn-' + size;\n---\n<Component class={cn('btn', 'btn-' + variant, 'btn-' + size)} href={href} disabled={disabled} {...attrs}>\n  <slot />\n</Component>");

    // Card component
    components.set("Card.astro", "---\ninterface Props {\n  children: any;\n  variant?: 'default' | 'outlined' | 'elevated';\n  class?: string;\n}\nconst { children, variant = 'default', class: className, ...attrs } = Astro.props;\nconst variants = {\n  default: 'bg-white border border-neutral-200 shadow-sm',\n  outlined: 'bg-white border-2 border-neutral-300',\n  elevated: 'bg-white shadow-lg',\n};\n---\n<div class={'card ' + variants[variant] + ' ' + (className || '')} {...attrs}>\n  <slot />\n</div>");

    return components;
  }

  private generatePages(_theme: any): Map<string, string> {
    const pages = new Map<string, string>();

    // Index page
    pages.set("index.astro", "---\nimport Layout from '../layouts/Layout.astro';\n---\n<Layout title=\"Home\">\n  <main class=\"space-y-12\">\n    <section class=\"hero min-h-[60vh] flex items-center justify-center bg-neutral-50\">\n      <div class=\"max-w-3xl text-center px-4\">\n        <h1 class=\"text-4xl md:text-6xl font-bold text-neutral-900 mb-6\">\n          Welcome to <span class=\"text-brand-primary-600\">" + _theme.name + "</span>\n        </h1>\n        <p class=\"text-xl text-neutral-500 mb-8 max-w-2xl mx-auto\">\n          " + (_theme.description || "A beautiful site built with Sard CMS") + "\n        </p>\n        <div class=\"flex gap-4 justify-center\">\n          <a href=\"/collections/posts\" class=\"btn btn-primary\">\n            Read Articles\n          </a>\n          <a href=\"/collections/pages\" class=\"btn btn-outline btn-lg\">\n            View Pages\n          </a>\n        </div>\n      </div>\n    </section>\n\n    <section class=\"py-16 px-4 max-w-6xl mx-auto\">\n      <h2 class=\"text-3xl font-bold text-neutral-900 text-center mb-12\">\n        Latest Posts\n      </h2>\n      <div class=\"grid gap-6 md:grid-cols-2 lg:grid-cols-3\">\n        <ArticleCard />\n        <ArticleCard />\n        <ArticleCard />\n      </div>\n    </section>\n  </Layout>");

    return pages;
  }
}
