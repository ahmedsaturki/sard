/**
 * @module @sard/wp-compat/parsers/PHPParser
 *
 * Basic PHP parser for WordPress theme files.
 * Extracts function calls, hooks, template tags, etc.
 */

export class PHPParser {
  /**
   * Parse PHP file and extract WordPress-specific patterns
   */
  parsePHP(content: string): {
    functions: Array<{ name: string; params: string; body: string }>;
    hooks: Array<{ type: "action" | "filter"; hook: string; callback: string; priority: number }>;
    templateTags: string[];
    enqueues: Array<{ handle: string; src: string; deps: string[]; version: string; inFooter: boolean }>;
  } {
    const functions: Array<{ name: string; params: string; body: string }> = [];
    const hooks: Array<{ type: "action" | "filter"; hook: string; callback: string; priority: number }> = [];
    const templateTags: string[] = [];
    const enqueues: Array<{ handle: string; src: string; deps: string[]; version: string; inFooter: boolean }> = [];

    // Simple regex-based extraction (production would use PHP-Parser)
    const functionMatches = content.matchAll(/function\s+(\w+)\s*\(([^)]*)\)\s*\{([\s\S]*?)\n\}/g) || [];
    for (const match of functionMatches) {
      if (!match[1] || !match[2] || !match[3]) continue;
      if (!match[1] || !match[2] || !match[3]) continue;
      functions.push({
        name: match[1],
        params: match[2],
        body: match[3],
      });
    }

    const hookMatches = content.matchAll(/(add_action|add_filter)\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\s*(?:,\s*(\d+))?\s*\)/g);
    for (const match of hookMatches) {
      if (!match[1] || !match[2] || !match[3]) continue;
      if (!match[1] || !match[2] || !match[3]) continue;
      hooks.push({
        type: match[1] === "add_action" ? "action" : "filter",
        hook: match[2],
        callback: match[3],
        priority: match[4] ? parseInt(match[4]) : 10,
      });
    }

    const templateTagMatches = content.matchAll(/(the_title|the_content|the_excerpt|the_permalink|the_post_thumbnail|wp_head|wp_footer|get_header|get_footer|get_sidebar|get_template_part)\s*\(/g) || [];
    for (const match of templateTagMatches) {
      if (!match[1]) continue;
      if (!match[1]) continue;
      templateTags.push(match[1]);
    }

    return { functions, hooks, templateTags, enqueues };
  }
}
