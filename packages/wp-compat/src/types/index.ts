/**
 * @module @sard/wp-compat/types
 *
 * Type definitions for WordPress Compatibility Layer.
 * See ADR-0007 (WP Compatibility Layer).
 */

// import type { PortableTextBlock } from "@sard/portable-text";

/**
 * WordPress theme structure
 */
export interface WPTheme {
  name: string;
  version: string;
  author: string;
  description: string;
  template?: string; // parent theme
  stylesheet: string;
  tags: string[];
  screenshot?: string;
  textDomain: string;
  domainPath: string;
  requiresWP: string;
  requiresPHP: string;
  templateFiles: Record<string, string>; // path -> content
  stylesheetContent: string;
  functionsContent: string;
  themeJson?: WPThemeJson;
}

/**
 * WordPress theme.json structure
 */
export interface WPThemeJson {
  version: number;
  settings: {
    color?: {
      palette: WPColorPaletteItem[];
      custom: boolean;
      customDuotone: boolean;
      customGradient: boolean;
      duotone: WPColorPaletteItem[];
      gradients: WPGradient[];
      linkColor: boolean;
    };
    typography: {
      customFontSize: boolean;
      customLineHeight: boolean;
      fontFamilies: WPFontFamily[];
      fontSizes: WPFontSize[];
      letterSpacing: boolean;
      customSpacing: boolean;
    };
    spacing: {
      padding: boolean;
      margin: boolean;
      customSpacing: boolean;
      spacingScale: WPSpacingScaleItem[];
      spacingSizes: WPSpacingSize[];
    };
    border: {
      customColor: boolean;
      customRadius: boolean;
      customStyle: boolean;
      customWidth: boolean;
    };
    layout: {
      contentSize: string;
      wideSize: string;
    };
    custom: {
      css: {
        properties: string[];
      };
    };
  };
  customTemplates: WPCustomTemplate[];
  templateParts: WPTemplatePart[];
  patterns: WPPattern[];
}

export interface WPColorPaletteItem {
  slug: string;
  color: string;
  name: string;
}

export interface WPGradient {
  slug: string;
  gradient: string;
  name: string;
}

export interface WPFontFamily {
  fontFamily: string;
  name: string;
  slug: string;
  fontFace: WPFontFace[];
}

export interface WPFontFace {
  fontFamily: string;
  fontWeight: string | number;
  fontStyle: string;
  src: string;
}

export interface WPFontSize {
  slug: string;
  size: string;
  name: string;
  lineHeight?: number;
}

export interface WPSpacingScaleItem {
  slug: string;
  size: string;
  name: string;
}

export interface WPSpacingSize {
  slug: string;
  size: string;
  name: string;
}

export interface WPCustomTemplate {
  name: string;
  title: string;
  postTypes: string[];
  icon?: string;
  path: string;
}

export interface WPTemplatePart {
  slug: string;
  title: string;
  area: "header" | "footer" | "sidebar" | "uncategorized";
  theme: string;
  path: string;
}

export interface WPPattern {
  slug: string;
  title: string;
  content: string;
  categories: string[];
  keywords: string[];
  viewportWidth: number;
  inserter: boolean;
}

/**
 * Parsed WordPress theme result
 */
export interface ParsedWPTheme {
  theme: WPTheme;
  astroComponents: Map<string, string>; // component name -> Astro component code
  astroStyles: string; // global CSS
  astroConfig: string; // astro.config.mjs content
  packageJson: string; // package.json for Astro project
  sardConfig: string; // sard.config.ts content
}

/**
 * Conversion options
 */
export interface ConversionOptions {
  targetFramework: "astro" | "nextjs" | "sard-native";
  preserveCustomCss: boolean;
  convertThemeJson: boolean;
  generateSardConfig: boolean;
  strictMode: boolean;
}

/**
 * Conversion result
 */
export interface ConversionResult {
  success: boolean;
  theme: WPTheme;
  outputFiles: Map<string, string>; // file path -> content
  warnings: string[];
  errors: string[];
}
