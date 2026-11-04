/**
 * @module @sard-cms/wp-compat
 *
 * WordPress Compatibility Layer - L2: Theme to Astro Conversion.
 * Converts WordPress themes to Astro components with Sard integration.
 * See ADR-0007 (WP Compatibility Layer).
 */

export * from "./types/index.js";
export { ThemeConverter } from "./converters/ThemeConverter.js";
export { WPThemeParser } from "./parsers/WPThemeParser.js";
export { AstroGenerator } from "./generators/AstroGenerator.js";
export { defaultConversionOptions } from "./converters/options.js";

