/**
 * @module @sard-cms/wp-compat/converters/options
 *
 * Default conversion options for WP theme to Astro conversion.
 */

import type { ConversionOptions } from "../types/index.js";

/**
 * Default conversion options for WP theme to Astro conversion.
 */
export const defaultConversionOptions: ConversionOptions = {
  targetFramework: "astro",
  preserveCustomCss: true,
  convertThemeJson: true,
  generateSardConfig: true,
  strictMode: false,
};

