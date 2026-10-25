/**
 * @module @sard/wp-compat/converters/ThemeConverter
 *
 * Converts WordPress themes to Sard-compatible Astro projects.
 * See ADR-0007 (WP Compatibility Layer).
 */

import type { ConversionOptions, ConversionResult } from "../types/index.js";
import { WPThemeParser } from "../parsers/WPThemeParser.js";
import { AstroGenerator } from "../generators/AstroGenerator.js";
import { defaultConversionOptions } from "./options.js";

export class ThemeConverter {
  private parser: WPThemeParser;
  private generator: AstroGenerator;
  private options: ConversionOptions;

  constructor(options: Partial<ConversionOptions> = {}) {
    this.parser = new WPThemeParser();
    this.generator = new AstroGenerator();
    this.options = { ...defaultConversionOptions, ...options };
  }

  /**
   * Convert a WordPress theme to Sard-compatible Astro project
   */
  async convert(themePath: string, options?: Partial<ConversionOptions>): Promise<ConversionResult> {
    const _opts = { ...this.options, ...options };
    void _opts;
    const parsed = await this.parser.parseTheme(themePath);

    try {
      // Generate Astro project
      const outputFiles = await this.generator.generate({
        theme: parsed.theme,
        themeJson: (parsed as any).themeJson,
      });

      return {
        success: true,
        theme: parsed.theme,
        outputFiles,
        warnings: [],
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        theme: {} as any,
        outputFiles: new Map(),
        warnings: [],
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }
}

export const themeConverter = new ThemeConverter();
