/**
 * @module @sard/wp-compat/parsers/WPThemeParser
 *
 * Parses WordPress theme files and extracts structure.
 */

import type { ParsedWPTheme, WPThemeJson, WPTheme } from "../types/index.js";
// import { CSSParser } from "./CSSParser.js";
// import { PHPParser } from "./PHPParser.js";

export class WPThemeParser {
  // private _cssParser: CSSParser;
  // private _phpParser: PHPParser;

  constructor() {
    // this._cssParser = new CSSParser();
    // this._phpParser = new PHPParser();
  }

  /**
   * Parse a WordPress theme directory
   */
  async parseTheme(_themePath: string): Promise<ParsedWPTheme> {
    // For now, return minimal structure
    // In production, this would parse actual theme files
    const theme: WPTheme = {
      name: "default",
      version: "1.0.0",
      author: "Unknown",
      description: "Converted WordPress theme",
      stylesheet: "style.css",
      tags: [],
      textDomain: "default",
      domainPath: "/languages",
      requiresWP: "5.0",
      requiresPHP: "7.0",
      templateFiles: {},
      stylesheetContent: "",
      functionsContent: "",
    };

    return {
      theme,
      astroComponents: new Map<string, string>(),
      astroStyles: "",
      astroConfig: "",
      packageJson: "",
      sardConfig: "",
    };
  }

  /**
   * Parse style.css header
   */
  parseStyleHeader(content: string): Record<string, string> {
    const header: Record<string, string> = {};
    const lines = content.split("\n");
    let inHeader = true;

    for (const line of lines) {
      if (!inHeader) break;
      const match = line.match(/^\s*([^:]+)\s*:\s*(.+)$/);
      if (match && match[1] && match[2]) {
        header[match[1].trim().toLowerCase()] = match[2].trim();
      } else if (line.trim() === "") {
        inHeader = false;
      }
    }
    return header;
  }

  /**
   * Parse theme.json if exists
   */
  parseThemeJson(content: string): WPThemeJson | undefined {
    try {
      return JSON.parse(content);
    } catch {
      return undefined;
    }
  }
}
