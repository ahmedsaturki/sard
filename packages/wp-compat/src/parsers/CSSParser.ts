/**
 * @module @sard/wp-compat/parsers/CSSParser
 *
 * Parses CSS and extracts design tokens compatible with Sard.
 */

import type { WPThemeJson } from "../types/index.js";

export class CSSParser {
  /**
   * Parse CSS and extract design tokens
   */
  parseCSS(css: string): {
    colors: Map<string, string>;
    typography: Map<string, any>;
    spacing: Map<string, string>;
    shadows: Map<string, string>;
    breakpoints: Map<string, string>;
  } {
    const colors = new Map<string, string>();
    const typography = new Map<string, any>();
    const spacing = new Map<string, string>();
    const shadows = new Map<string, string>();
    const breakpoints = new Map<string, string>();

    // Simple regex-based extraction (in production, use postcss)
    const colorMatches = css.matchAll(/--([\w-]+)\s*:\s*([^;]+)/g) || [];
    for (const match of colorMatches) {
      if (!match[1] || !match[2]) continue;
      if (!match[1] || !match[2]) continue;
      colors.set(match[1], match[2].trim());
    }

    // Extract font families
    const fontMatches = css.matchAll(/font-family\s*:\s*([^;]+)/g) || [];
    for (const match of fontMatches) {
      if (!match[1]) continue;
      if (!match[1]) continue;
      typography.set("fontFamily", match[1].trim());
    }

    return { colors, typography, spacing, shadows, breakpoints };
  }

  /**
   * Convert WP theme.json to Sard design tokens
   */
  themeJsonToDesignTokens(themeJson: WPThemeJson): {
    colors: Record<string, string>;
    typography: Record<string, any>;
    spacing: Record<string, string>;
  } {
    const colors: Record<string, string> = {};
    const typography: Record<string, any> = {};
    const spacing: Record<string, string> = {};

    if (themeJson.settings?.color?.palette) {
      for (const item of themeJson.settings.color.palette) {
        colors[item.slug] = item.color;
      }
    }

    if (themeJson.settings?.typography?.fontFamilies) {
      for (const font of themeJson.settings.typography.fontFamilies) {
        typography[font.slug] = {
          fontFamily: font.fontFamily,
          fontWeights: font.fontFace.map(f => f.fontWeight),
        };
      }
    }

    if (themeJson.settings?.spacing?.spacingSizes) {
      for (const item of themeJson.settings.spacing.spacingSizes) {
        spacing[item.slug] = item.size;
      }
    }

    return { colors, typography, spacing };
  }
}
